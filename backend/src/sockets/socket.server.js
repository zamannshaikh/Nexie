const { Server } = require("socket.io");
const cookie = require("cookie");
const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const generateResponse = require("../services/ai.service");
const messageModel=require("../models/message.model");

function initSocketServer(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        }
    });

    // Socket middleware for auth
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
                await messageModel.create({
                    chat:payload.chat,
                    user:socket.user._id,
                    content:payload.content,
                    role:"user"
                })
             


                const response = await generateResponse(payload.content);
                await messageModel.create({
                    chat:payload.chat,
                    user:socket.user._id,
                    content:response,
                    role:"model"
                })
                console.log("Response from AI:", response);

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
