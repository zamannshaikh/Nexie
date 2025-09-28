const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    email:{
        type:String,
        required:true,
        unique:true
    },
    fullName :{
        firstName:{
            type:String,
            required:true
        },
        lastName:{
            type:String,
            required:true
        }
    },
    password:{
        type:String,
        
    }
},
{timestamps:true}
);

const userModel = mongoose.model("User",userSchema);

module.exports=userModel;