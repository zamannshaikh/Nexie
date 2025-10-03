const userModel=require("../models/user.model");
const bcrypt=require("bcryptjs");
const jwt=require("jsonwebtoken");


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
        const token=jwt.sign({userId:user._id},process.env.JWT_SECRET);
        res.cookie('token',token,{
              httpOnly: true,
  secure: false,         // true if using https
  sameSite: "lax"       // 👈 needed for cross-origin
        });
        res.status(200).json({message:"Login successful"});
        console.log("User logged in:",user);
    } catch (error) {
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
     req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Could not log out, please try again' });
        }
        res.clearCookie('connect.sid'); // Clears the session cookie
        res.status(200).json({ message: 'User logged out successfully' });
    });
    
}



module.exports={registerUser, loginUser,currentUserController,logoutUser};