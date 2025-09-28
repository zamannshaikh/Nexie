const { Server } = require("socket.io");

function initSocketServer(httpServer) {
    const io = new Server(httpServer, {
        cors: {
            origin: "http://localhost:5173", // frontend URL
            methods: ["GET", "POST"]
        }
    });

    io.on("connection", (socket) => {
        console.log("New client connected", socket.id);

        socket.on("disconnect", () => {
            console.log("Client disconnected", socket.id);
        });
    });

    return io; // return so we can use it elsewhere
}

module.exports = initSocketServer;
