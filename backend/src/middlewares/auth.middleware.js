const jwt= require("jsonwebtoken");
const userModel=require("../models/user.model");


async function authMiddleware(req,res,next) {
    const {token}=req.cookies;
    if(!token){
        return res.status(401).json({message:"Unauthorized access"});
    } 
    try {
        const decoded=jwt.verify(token,process.env.JWT_SECRET);
        const user=await userModel.findById(decoded.userId);
        req.user=user;
        next();
    } catch (error) {
        console.error("Error in auth middleware:",error);
        res.status(500).json({message:"Internal server error"});
    }
}

module.exports=authMiddleware;