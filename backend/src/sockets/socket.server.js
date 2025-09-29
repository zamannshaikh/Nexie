const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const { generateResponse, generateVector } = require("../services/ai.service");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../services/vector.service");

const MAX_SHORT_TERM_CHATS = 10; // 🔥 Limit short-term memory to last 10 messages
const MAX_MEMORY_RESULTS = 3; // Pinecone results limit

function initSocketServer(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // ✅ Auth middleware
    io.use(async (socket, next) => {
        try {
            const cookies = socket.handshake.headers?.cookie || "";
            const parsedCookies = cookie.parse(cookies);

            const token =
                parsedCookies.token ||
                socket.handshake.auth?.token ||
                socket.handshake.query?.token;

            if (!token) return next(new Error("No token found"));

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await userModel.findById(decoded.userId);

            if (!user) return next(new Error("User not found"));

            socket.user = user;
            next();
        } catch (error) {
            console.error("Socket auth error:", error.message);
            next(new Error("Unauthorized"));
        }
    });

    io.on("connection", (socket) => {
        console.log("✅ New client connected", socket.id, "User:", socket.user?.email);

        socket.on("message", async (payload) => {
            try {
                if (!payload?.content) {
                    return socket.emit("response", {
                        content: "Invalid message payload",
                        chat: payload?.chat,
                        error: true
                    });
                }

                // 1️⃣ Save user message in MongoDB
                const userMessage = await messageModel.create({
                    chat: payload.chat,
                    user: socket.user._id,
                    content: payload.content,
                    role: "user"
                });

                // 2️⃣ Generate embedding for user message
                const userVector = await generateVector(payload.content);

                // 3️⃣ Query Pinecone memory (long-term memory)
                const memoryMatches = await queryMemory({
                    queryVector: userVector,
                    limit: MAX_MEMORY_RESULTS
                });

                console.log("🧠 Memory Results:", memoryMatches.map(m => ({
                    id: m.id,
                    score: m.score.toFixed(3),
                    metadata: m.metadata
                })));

                // 4️⃣ Store current message in Pinecone for future memory
                await createMemory({
                    vectors: userVector,
                    messageId: userMessage._id.toString(),
                    metadata: {
                        chat: payload.chat.toString(),
                        user: socket.user._id.toString(),
                        text: payload.content,
                        role: "user"
                    }
                });

                // 5️⃣ Fetch only LAST N messages from DB (short-term memory)
                const shortTermMessages = await messageModel.find({ chat: payload.chat })
                    .sort({ createdAt: -1 }) // newest first
                    .limit(MAX_SHORT_TERM_CHATS) // only last 10 messages
                    .lean();

                // Reverse to chronological order (oldest → newest)
                shortTermMessages.reverse();

                // 6️⃣ Format Pinecone memory into chat format
                const memoryHistory = memoryMatches
                    .filter(m => m?.metadata?.text) // only valid ones
                    .map(m => ({
                        role: m.metadata.role || "user",
                        parts: [{ text: m.metadata.text }]
                    }));

                // 7️⃣ Format short-term memory from MongoDB
                const shortTermHistory = shortTermMessages.map(msg => ({
                    role: msg.role,
                    parts: [{ text: msg.content }]
                }));

                // 8️⃣ Merge memory + short-term history + current message
                const fullContext = [...memoryHistory, ...shortTermHistory, {
                    role: "user",
                    parts: [{ text: payload.content }]
                }];

                // 9️⃣ Generate AI response
                const response = await generateResponse(fullContext);

                // 🔟 Save AI response to DB
                const responseMessage = await messageModel.create({
                    chat: payload.chat,
                    user: socket.user._id,
                    content: response,
                    role: "model"
                });

                // 1️⃣1️⃣ Store AI response in Pinecone
                const responseVector = await generateVector(response);
                await createMemory({
                    vectors: responseVector,
                    messageId: responseMessage._id.toString(),
                    metadata: {
                        chat: payload.chat.toString(),
                        user: socket.user._id.toString(),
                        text: response,
                        role: "model"
                    }
                });

                console.log("🤖 Response from AI:", response);

                // 1️⃣2️⃣ Send back to frontend
                socket.emit("response", {
                    content: response,
                    chat: payload.chat
                });

            } catch (error) {
                console.error("❌ Error generating response:", error.message);
                socket.emit("response", {
                    content: "Sorry, I couldn't process your message.",
                    chat: payload?.chat,
                    error: true
                });
            }
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected", socket.id);
        });
    });

    return io;
}

module.exports = initSocketServer;
