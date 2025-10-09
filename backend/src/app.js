const express = require('express');
const cookieParser = require('cookie-parser');
const cors= require("cors")
const helmet = require('helmet');
const app=express();
const path = require('path');


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
app.use(express.static(path.join(__dirname, '..', 'public')));



app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});


// using routes
app.use('/api/auth',authRoutes);
app.use('/api/chats',chatRoutes);



app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});


module.exports=app;