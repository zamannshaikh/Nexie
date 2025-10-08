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

// Replace the entire 'socket.on("message", ...)' block with this

io.on("connection", (socket) => {
    console.log("New client connected", socket.id, "User:", socket.user?.email);

    socket.on("message", async (payload) => {
      socket.emit("response_pending", { chat: payload.chat });
      console.log(`Acknowledged message for chat ${payload.chat}. Now processing...`);
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

        // 2) Query Pinecone for relevant message IDs from long-term memory
        const memoryMatches = await queryMemory({
          queryVector: userVector,
          limit: 3,
          filter: { user: { '$eq': socket.user._id.toString() } }
        });

        // 3) Fire-and-forget upsert into Pinecone (WITHOUT full text in metadata)
        createMemory({
          vectors: userVector,
          messageId: message._id.toString(), // The ID is the link to MongoDB
          metadata: {
            chat: String(payload.chat),
            user: socket.user._id.toString(),
            role: "user"
            // 'text' field is correctly REMOVED to prevent size errors
          }
        }).catch(err => console.error("Memory store error:", err));

        // 4) Fetch recent messages for short-term memory
        const MAX_SHORT = 10;
        const recentMessages = await messageModel.find({ chat: payload.chat })
          .sort({ createdAt: -1 })
          .limit(MAX_SHORT)
          .lean();
        recentMessages.reverse(); // oldest -> newest

        // 5) Build short-term history (the current conversation)
        const shortTermHistory = recentMessages.map(m => ({
          role: m.role === "model" ? "model" : "user",
          parts: [{ text: m.content }]
        }));

        // 6) Consolidate Long-Term Memory into a single context string
        let longTermMemoryContext = "No relevant past context found.";
        if (memoryMatches && memoryMatches.length > 0) {
          // Get the actual message content from MongoDB using the IDs from Pinecone
          const memoryMessageIds = memoryMatches.map(m => m.id);
          const longTermMessages = await messageModel.find({
            _id: { $in: memoryMessageIds }
          }).sort({ createdAt: 'asc' }).lean();

          // Format the messages into a single, readable block for the LLM
          longTermMemoryContext = "Here are relevant snippets from our past conversations:\n---\n";
          longTermMemoryContext += longTermMessages
            .map(m => `${m.role === 'user' ? 'User asked' : 'You answered'}: ${m.content}`)
            .join("\n---\n");
        }

        // 7) Build the final history with the robust "Context Injection" structure
        const finalHistory = [];

        // Add the consolidated context block as the first user message
        finalHistory.push({
            role: "user",
            parts: [{
                text: `${longTermMemoryContext}\n\nINSTRUCTION: Using the context from our past conversations above and the immediate messages below, please provide a helpful and relevant response to my final message.`
            }]
        });

        // Add a "priming" model message to acknowledge the context and set up the conversation
        finalHistory.push({
            role: "model",
            parts: [{ text: "Okay, I have reviewed the context. I am ready to continue our current conversation." }]
        });
        
        // Add the short-term conversation history
        finalHistory.push(...shortTermHistory);


        // 8) Log for debugging and call the model
        console.log("Final history (sent to generateResponse):");
        console.log(JSON.stringify(finalHistory, null, 2));

        const response = await generateResponse(finalHistory);

        // 9) Save model response and its vector in parallel
        const [responseMessage, responseVector] = await Promise.all([
          messageModel.create({
            chat: payload.chat,
            user: socket.user._id,
            content: response,
            role: "model"
          }),
          generateVector(response)
        ]);

        // 10) Store model response vector in Pinecone (WITHOUT full text in metadata)
        createMemory({
          vectors: responseVector,
          messageId: responseMessage._id.toString(), // The link to MongoDB
          metadata: {
            chat: String(payload.chat),
            user: socket.user._id.toString(),
            role: "model"
             // 'text' field is correctly REMOVED
          }
        }).catch(err => console.error("Memory store error:", err));

        // 11) Send response back to the client
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

    socket.on("disconnect", () => {
      console.log("Client disconnected", socket.id);
    });
  });

  return io;
}

module.exports = initSocketServer;
