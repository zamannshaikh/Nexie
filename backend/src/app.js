const express = require('express');
const cookieParser = require('cookie-parser');
const cors= require("cors")

const app=express();
const path = require('path');


// import routes
const authRoutes=require("./routes/auth.routes");
const chatRoutes=require("./routes/chat.route");
const gatewayTokenRoutes = require("./routes/gatewayToken.routes");


// middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin:["https://nexie-1inf.onrender.com","https://nexie.in","https://www.nexie.in","http://localhost:5173"],
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
app.use('/api/gateway/token', gatewayTokenRoutes);



// Do not serve index.html for /api OR /socket.io requests
app.get(/^(?!\/(api|socket.io)).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});


module.exports=app;