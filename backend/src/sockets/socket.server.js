const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const { generateResponse, generateVector } = require("../services/ai.service");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../services/vector.service");

function initSocketServer(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // 🔑 Middleware: Auth check for every socket
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
        console.log("New client connected", socket.id, "User:", socket.user?.email);

        socket.on("message", async (payload) => {
            try {
                if (!payload?.content) {
                    return socket.emit("response", {
                        content: "Invalid message payload",
                        chat: payload?.chat,
                        error: true
                    });
                }

                // 1️⃣ Save user message + generate its vector in parallel
                const [message, userVectors] = await Promise.all([
                    messageModel.create({
                        chat: payload.chat,
                        user: socket.user._id,
                        content: payload.content,
                        role: "user"
                    }),
                    generateVector(payload.content)
                ]);

                // 2️⃣ Query long-term memory
                const memory = await queryMemory({
                    queryVector: userVectors,
                    limit: 3
                });

                console.log("Memory===>>> ", memory.map(m => ({
                    id: m.id,
                    score: m.score,
                    metadata: m.metadata
                })));

                // 3️⃣ Store the user message in memory (async)
                createMemory({
                    vectors: userVectors,
                    messageId: message._id.toString(),
                    metadata: {
                        chat: payload.chat.toString(),
                        user: socket.user._id.toString(),
                        role: "user",
                        text: payload.content
                    }
                }).catch(err => console.error("Memory store error:", err));

                // 4️⃣ Prepare short-term memory (last 10 messages)
                const recentMessages = await messageModel.find({ chat: payload.chat })
                    .sort({ createdAt: -1 }) // latest first
                    .limit(10)
                    .lean();

                const stm = recentMessages.reverse().map(item => ({
                    role: item.role,
                    parts: [{ text: item.content }]
                }));

                // 5️⃣ Prepare long-term memory (hybrid approach)
                const ltm = [
                    {
                        role: "system",
                        parts: [{
                            text: "Here are some relevant past conversation snippets. Use them only for context and answer naturally."
                        }]
                    },
                    ...memory.map(item => ({
                        role: item.metadata?.role || "user",
                        parts: [{ text: item.metadata?.text }]
                    }))
                ];

                // 6️⃣ Generate AI response
                const response = await generateResponse([...ltm, ...stm, {
                    role: "user",
                    parts: [{ text: payload.content }]
                }]);

                // 7️⃣ Save model response + generate its vector in parallel
                const [responseMessage, responseVectors] = await Promise.all([
                    messageModel.create({
                        chat: payload.chat,
                        user: socket.user._id,
                        content: response,
                        role: "model"
                    }),
                    generateVector(response)
                ]);

                // 8️⃣ Store AI response in memory (async)
                createMemory({
                    vectors: responseVectors,
                    messageId: responseMessage._id.toString(),
                    metadata: {
                        chat: payload.chat.toString(),
                        user: socket.user._id.toString(),
                        role: "model",
                        text: response
                    }
                }).catch(err => console.error("Memory store error:", err));

                console.log("Response from AI:", response);

                // 9️⃣ Send response to client
                socket.emit("response", {
                    content: response,
                    chat: payload.chat
                });

            } catch (error) {
                console.error("Error generating response:", error.message);
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
