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

    // CORRECTED socket.server.js

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

    // 2) Query Pinecone for relevant message IDs
    const memoryMatches = await queryMemory({
      queryVector: userVector,
      limit: 3,
      filter: { user: { '$eq': socket.user._id.toString() } }
    });

    // 3) Fire-and-forget upsert into Pinecone (WITHOUT full text)
    createMemory({
      vectors: userVector,
      messageId: message._id.toString(), // The ID is the link to MongoDB
      metadata: { // CORRECTED METADATA
        chat: String(payload.chat),
        user: socket.user._id.toString(),
        role: "user"
        // The 'text' field has been REMOVED
      }
    }).catch(err => console.error("Memory store error:", err));

    // 4) Fetch recent messages for short-term memory
    const MAX_SHORT = 10;
    const recentMessages = await messageModel.find({ chat: payload.chat })
      .sort({ createdAt: -1 })
      .limit(MAX_SHORT)
      .lean();
    recentMessages.reverse();

    // 5) Build short-term history
    const shortTermHistory = recentMessages.map(m => ({
      role: m.role === "model" ? "model" : "user",
      parts: [{ text: m.content }]
    }));

    // 6) NEW STEP: Fetch long-term memory content from MongoDB using IDs from Pinecone
    let longTermMemory = [];
    if (memoryMatches && memoryMatches.length > 0) {
      // Extract the MongoDB message IDs from the Pinecone query results
      const memoryMessageIds = memoryMatches.map(m => m.id);
      
      // Fetch the actual message documents from MongoDB
      const longTermMessages = await messageModel.find({
        _id: { $in: memoryMessageIds }
      }).lean();

      // Build the long-term memory in the format Gemini needs
      longTermMemory = longTermMessages.map(m => ({
        role: m.role === "model" ? "model" : "user",
        parts: [{ text: m.content }]
      }));
    }

    // 7) Build final history for the AI model
    const ltmInstruction = {
      role: "user",
      parts: [{
        text: "Relevant past conversation snippets (use only for context):"
      }]
    };

    const finalHistory = [
      ltmInstruction,
      ...longTermMemory,
      ...shortTermHistory
    ];

    console.log("Final history (sent to generateResponse):");
    console.log(JSON.stringify(finalHistory, null, 2));

    // 8) Call the model
    const response = await generateResponse(finalHistory);

    // 9) Save model response and generate its vector
    const [responseMessage, responseVector] = await Promise.all([
      messageModel.create({
        chat: payload.chat,
        user: socket.user._id,
        content: response,
        role: "model"
      }),
      generateVector(response)
    ]);

    // 10) Store model response vector in Pinecone (WITHOUT full text)
    createMemory({
      vectors: responseVector,
      messageId: responseMessage._id.toString(), // The link to MongoDB
      metadata: { // CORRECTED METADATA
        chat: String(payload.chat),
        user: socket.user._id.toString(),
        role: "model"
        // The 'text' field has been REMOVED
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
