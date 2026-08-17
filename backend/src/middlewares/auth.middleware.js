// const jwt= require("jsonwebtoken");
// const userModel=require("../models/user.model");


// async function authMiddleware(req,res,next) {
//     const {token}=req.cookies;
//     if(!token){
//         return res.status(401).json({message:"Unauthorized access"});
//     } 
//     try {
//         const decoded=jwt.verify(token,process.env.JWT_SECRET);
//         const user=await userModel.findById(decoded.userId);
//         req.user=user;
//         next();
//     } catch (error) {
//         console.error("Error in auth middleware:",error);
//         res.status(500).json({message:"Internal server error"});
//     }
// }

// module.exports=authMiddleware;












const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");

const authMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await userModel.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = user;
        next();
    } catch (err) {

        if (err) {
            // Check specifically for expiration
            if (err.name === 'TokenExpiredError') {
                console.log(`[AUTH LOG] ⚠️ Access token expired at: ${err.expiredAt}`);
            } else {
                console.log(`[AUTH LOG] ❌ Token validation failed: ${err.message}`);
            }
        }

        return res.status(403).json({ message: "Forbidden" });
    }
};

module.exports = authMiddleware;