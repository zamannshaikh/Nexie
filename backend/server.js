require("dotenv").config();
const app= require("./src/app");
const connectDB=require("./src/db/db");
const initSocketServer=require("./src/sockets/socket.server");
const httpServer=require("http").createServer(app); 

initSocketServer(httpServer);
connectDB();





httpServer.listen(5000,()=>{
    console.log("server is running on port 5000");
})