// socket.server.js
const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const { generateResponse, generateVector } = require("../services/ai.service");
const messageModel = require("../models/message.model");
const { createMemory, queryMemory } = require("../services/vector.service");
// Add this line at the top of socket.server.js
const { HumanMessage, AIMessage } = require("@langchain/core/messages");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: [
      "https://nexie.in", 
      "https://www.nexie.in",
      "https://nexie-1inf.onrender.com", // Keep your render URL if needed
      "http://localhost:5173" // Keep localhost for development
    ],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Auth middleware
  io.use(async (socket, next) => {
    console.log("🔒 Verifying Socket Connection for:", socket.id);
    //  THIS BYPASS FOR THE RUST GATEWAY 
    if (socket.handshake.query?.clientType === "rust_gateway") {
      console.log("✅ Rust Local Gateway authorized.");
      socket.isGateway = true; // Tag this socket so we know it's the gateway
      return next(); 
    }
    try {
      const cookies = socket.handshake.headers?.cookie || "";
      console.log("🍪 Cookies received:", cookies ? "Yes" : "No");
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

 

    // CORRECTED socket.server.js

// Replace the entire 'socket.on("message", ...)' block with this

io.on("connection", (socket) => {

  // Check if this is the web user or the Rust gateway
    if (socket.isGateway) {
      console.log("⚡ Gateway connected successfully:", socket.id);

      // Listen for terminal output coming back from Rust
      socket.on("command_result", (data) => {
        console.log("✅ Output from Mac:\n", data.output);
      });

      // Test: Send a command to Rust 3 seconds after it connects
      setTimeout(() => {
        console.log("🤖 Nexie is sending a command to your Mac...");
        socket.emit("execute_command", { command: "mkdir nexie_test_folder" });
      }, 3000);

      return; // Stop here so the gateway doesn't load the normal chat listeners
    }
    console.log("New client connected", socket.id, "User:", socket.user?.email);

    socket.on("message", async (payload,callback) => {
      console.log("Message received:", payload.content);
      if (callback) callback({ status: "ok" });
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

       const MAX_SHORT = 10;
        const recentMessages = await messageModel.find({ chat: payload.chat })
          .sort({ createdAt: -1 }) // Get newest first
          .limit(MAX_SHORT)
          .lean();
        
        recentMessages.reverse(); // Now oldest -> newest

        // 5) Build short-term history (the current conversation)
        const shortTermHistory = recentMessages
          .filter(m => m._id.toString() !== message._id.toString()) 
          .map(m => {
            if (m.role === "user") {
              return new HumanMessage(m.content);
            } else {
              return new AIMessage(m.content);
            }
          });

        // 6) Consolidate Long-Term Memory into a single context string
       let longTermMemoryContext = "No relevant past context found.";
        if (memoryMatches && memoryMatches.length > 0) {
          const memoryMessageIds = memoryMatches.map(m => m.id);
          const longTermMessages = await messageModel.find({
            _id: { $in: memoryMessageIds }
          }).sort({ createdAt: 'asc' }).lean();

          longTermMemoryContext = "Here are relevant snippets from our past conversations:\n---\n";
          longTermMemoryContext += longTermMessages
            .map(m => `${m.role === 'user' ? 'User asked' : 'You answered'}: ${m.content}`)
            .join("\n---\n");
        }

        // 7) Build the final history with the robust "Context Injection" structure
        const langchainHistory = [];

        // Add the consolidated context block as the first user message
        langchainHistory.push(new HumanMessage(
            `${longTermMemoryContext}\n\nINSTRUCTION: Using the context above, answer the user's latest message.`
        ));

        // Add a "priming" model message to acknowledge the context and set up the conversation
        langchainHistory.push(new AIMessage("Okay, I've reviewed the context. I'm ready!"));
        langchainHistory.push(...shortTermHistory);
        // Add the short-term conversation history
        langchainHistory.push(new HumanMessage(payload.content));


        // 8) Log for debugging and call the model
        console.log("Final history (sent to generateResponse):");
        console.log("Sending to LangGraph:", langchainHistory.length, "messages");
     const response = await generateResponse(langchainHistory, socket.user.name);

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

  
 

  return io;
}

module.exports = initSocketServer;
