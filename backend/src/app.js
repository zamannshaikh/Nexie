const express = require('express');
const cookieParser = require('cookie-parser');
const cors= require("cors")
const app=express();

// import routes
const authRoutes=require("./routes/auth.routes");
const chatRoutes=require("./routes/chat.route");


// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin:"http://localhost:5173",
    credentials:true
}))


// using routes
app.use('/api/auth',authRoutes);
app.use('/api/chats',chatRoutes);





module.exports=app;