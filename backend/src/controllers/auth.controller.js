const userModel=require("../models/user.model");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");
const { OAuth2Client } = require('google-auth-library');
const {redisClient}= require("../db/redis");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
// Helper to generate your application's token
const generateToken = (id) => {
    return jwt.sign({ userId: id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};


async function registerUser(req,res) {
    const {name,email,password}=req.body;
    const hashedPassword=await bcrypt.hash(password,10);
    try {
        const existingUser = await userModel.findOne({email});
        if(existingUser){
            return res.status(400).json({message:"User with this email already exists"});
        }
        const newUser = new userModel({
            name,
            email,
            password:hashedPassword
        });
        await newUser.save();
          const token = jwt.sign({userId:newUser._id},process.env.JWT_SECRET);
        res.cookie('token',token);
        res.status(201).json({message:"User registered successfully"});
        console.log("New user registered:",newUser);
      
        
    } catch (error) {
        console.error("Error in user registration:",error);
        res.status(500).json({message:"Internal server error"});
    }
    
}
async function loginUser(req,res) {
    const {email,password}=req.body;
    try {
        const user=await userModel.findOne({email});
        if(!user){
            return res.status(400).json({message:"Invalid email or password"});
        }
        const isPasswordValid=await bcrypt.compare(password,user.password);
        if(!isPasswordValid){
            return res.status(400).json({message:"Invalid email or password"});
        }
        // const token=jwt.sign({userId:user._id},process.env.JWT_SECRET);

        const userId = user._id.toString();



        const accessToken = jwt.sign(
        { userId: userId }, 
        process.env.ACCESS_TOKEN_SECRET, 
        { expiresIn: '15m' } 
    );

    const refreshToken = jwt.sign(
        { userId: userId }, 
        process.env.REFRESH_TOKEN_SECRET, 
        { expiresIn: '7d' } 
    );


    try {
        // ioredis syntax: .set(key, value, 'EX', expiration_in_seconds)
        // 7 days = 604800 seconds
        await redisClient.set(userId, refreshToken, 'EX', 604800);
    } catch (error) {
        return res.status(500).json({ message: 'Failed to store session' });
    }



//         res.cookie('token',token,{
//               httpOnly: true,
//   secure: true,         // true if using https
//   sameSite: "none"       // 👈 needed for cross-origin
//         });




    res.cookie('jwt', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict', // or 'None' if frontend and backend are on different domains in production
            maxAge: 7 * 24 * 60 * 60 * 1000
        });
           console.log("User logged in:",user);

        // 2. Send the single final JSON response with ALL required data
        return res.status(200).json({
            message: "Login successful",
            accessToken: accessToken,
            user: user // Sending this so your Redux store can grab it!
        });
    
     
    }
    
    
    catch (error) {
        console.error("Error in user login:",error);
        res.status(500).json({message:"Internal server error"});
    }
}




async function currentUserController(req,res) {
     try {
        if (!req.user) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        // Return user data (without password)
        const { _id, name, email } = req.user;
        res.json({ _id, name, email });

    } catch (error) {
        console.error("Error fetching current user:", error);
        res.status(500).json({ message: "Server error" });
    }
}



async function logoutUser(req,res) {
     try {

        const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(204);

        const decoded = jwt.decode(cookies.jwt);
    if (decoded?.userId) {
        await redisClient.del(decoded.userId); // Remove from Cloud Redis
    }

    res.clearCookie('jwt', { httpOnly: true, sameSite: 'Strict', secure: true });
    res.sendStatus(204);
    

    } catch (error) {
        // If something goes wrong on the server, send an error response.
        console.error("Error during logout:", error);
        res.status(500).json({ message: "Server error during logout." });
    }
}




// NEW: Controller for Google Login
const loginWithGoogle = async (req, res) => {
    const { token } = req.body;
    console.log("Received Google token:", token);

    try {
        // 1. Verify the Google token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        });

        const payload = ticket.getPayload();
        const { name, email } = payload;

        // 2. Check if user exists in your database
        let user = await userModel.findOne({ email });
        

        // 3. If user doesn't exist, create a new one
        if (!user) {
            // Note: Google doesn't provide a password. You might want to
            // create users from Google without a password field, or generate a random one.
            // A common approach is to have a field like 'authMethod: "google"'
            user = await userModel.create({
                name,
                email
            });
            console.log("New user created via Google login:", user);
            console.log("User logged in via Google:", user._id);
        }
        
        // 4. If the user was found but signed up with email/password previously,
        // you might want to handle this case (e.g., link accounts), but for now, we'll just log them in.

        // 5. Generate your application's token and send response
        const appToken = generateToken(user._id);

         res.cookie('token', appToken, {
            httpOnly: true,
            secure: true,   // true in production (https)
            sameSite: "none"
        });

         res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            message: "Google login successful"
        });

    } catch (error) {
        console.error("Error verifying Google token:", error);
        res.status(401).json({ message: 'Invalid Google Token. Please try again.' });
    }
};






async function refreshTokenController(req,res) {


    
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.status(401).json({ message: 'Unauthorized' });

    const refreshToken = cookies.jwt;

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
        if (err) return res.status(403).json({ message: 'Forbidden' });

        const userId = decoded.userId;

        try {
            const storedToken = await redisClient.get(userId);
            if (!storedToken || storedToken !== refreshToken) {
                return res.status(403).json({ message: 'Session expired or invalid' });
            }

            const newAccessToken = jwt.sign({  userId: userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
            res.json({ accessToken: newAccessToken });
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    });
    
}




module.exports={registerUser, loginUser,currentUserController,logoutUser,loginWithGoogle,refreshTokenController};