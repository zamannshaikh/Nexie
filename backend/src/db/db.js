const mongoose = require("mongoose");


async function connectDB(){
    try{
       await mongoose.connect(process.env.MONGODB_URI,{
            useNewUrlParser: true,
      useUnifiedTopology: true,
       })
        console.log("MongoDB connected");
    }catch(error){
        console.error("MongoDB connection error:",error);
       
    }
}

module.exports=connectDB;

