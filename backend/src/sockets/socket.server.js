// socket.server.js
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

  // Auth middleware
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
    } catch (err) {
      console.error("Socket auth error:", err.message);
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
        console.log("Message received from user :", payload.content);

        // 1) Save user message & create vector in parallel
        const [message, userVector] = await Promise.all([
          messageModel.create({
            chat: payload.chat,
            user: socket.user._id,
            content: payload.content,
            role: "user"
          }),
          generateVector(payload.content)
        ]);

        // 2) Query Pinecone for long-term memory (must include metadata in queryMemory impl)
        const memoryMatches = await queryMemory({
          queryVector: userVector,
          limit: 3
        });

        console.log("Pinecone matches:", memoryMatches.map(m => ({
          id: m.id,
          score: m.score,
          metadata: m.metadata
        })));

        // 3) Fire-and-forget upsert of this user message into Pinecone (non-blocking)
        createMemory({
          vectors: userVector,
          messageId: message._id.toString(),
          metadata: {
            chat: String(payload.chat),
            user: socket.user._id.toString(),
            role: "user",
            text: payload.content
          }
        }).catch(err => console.error("Memory store error:", err));

        // 4) Fetch only last N short-term messages (excluding none; the saved message WILL be included)
        const MAX_SHORT = 10;
        const recentMessages = await messageModel.find({ chat: payload.chat })
          .sort({ createdAt: -1 })
          .limit(MAX_SHORT)
          .lean();

        // chronological order (oldest -> newest)
        recentMessages.reverse();
        console.log("RECENT MESSAGES===>>>> ",recentMessages)


        // 5) Build short-term history in Gemini format
        const shortTermHistory = recentMessages.map(m => ({
          role: m.role === "model" ? "model" : "user",
          parts: [{ text: m.content }]
        }));

        // 6) Build long-term memory (role-based) from Pinecone results
        // IMPORTANT: filter out empty metadata.text
        const longTermMemory = (memoryMatches || [])
          .filter(m => m?.metadata?.text)
          .map(m => ({
            role: (m.metadata.role === "model") ? "model" : "user",
            parts: [{ text: m.metadata.text }]
          }));

        // 7) Hybrid approach: add a short "user" instruction describing LTM usage, then LTM entries, then STM
        const ltmInstruction = {
          role: "user",
          parts: [{
            text: "Relevant past conversation snippets (use only for context):"
          }]
        };

        // Build final history:
        // Put LTM first (older context), then short-term history (recent messages)
        const finalHistory = [
          ltmInstruction,
          ...longTermMemory,
          ...shortTermHistory
        ];

        // IMPORTANT DEBUG LOG: inspect the exact payload being sent to the model
        console.log("Final history (sent to generateResponse):");
        console.log(JSON.stringify(finalHistory, null, 2));

        // 8) Call the model with the merged history (DO NOT append payload.content again — it's already in recentMessages)
        const response = await generateResponse(finalHistory);

        // 9) Save model response and response vector in parallel
        const [responseMessage, responseVector] = await Promise.all([
          messageModel.create({
            chat: payload.chat,
            user: socket.user._id,
            content: response,
            role: "model"
          }),
          generateVector(response)
        ]);

        // 10) Store model response in Pinecone (async)
        createMemory({
          vectors: responseVector,
          messageId: responseMessage._id.toString(),
          metadata: {
            chat: String(payload.chat),
            user: socket.user._id.toString(),
            role: "model",
            text: response
          }
        }).catch(err => console.error("Memory store error:", err));

        // 11) Send response back
        socket.emit("response", {
          content: response,
          chat: payload.chat
        });

      } catch (err) {
        console.error("Error generating response:", err);
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
