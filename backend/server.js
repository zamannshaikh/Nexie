require("dotenv").config();
const app= require("./src/app");
const connectDB=require("./src/db/db");
const initSocketServer=require("./src/sockets/socket.server");
const httpServer=require("http").createServer(app); 

initSocketServer(httpServer);
connectDB();

const PORT = process.env.PORT || 5000;



httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});