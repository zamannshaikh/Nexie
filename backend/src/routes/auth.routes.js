const express = require('express');
const { registerUser ,loginUser,currentUserController, logoutUser} = require('../controllers/auth.controller');
const authMiddleware=require("../middlewares/auth.middleware");

const router = express.Router();


router.post('/register', registerUser);
router.post('/login', loginUser);
// NEW: Route for Google authentication
router.post('/auth/google', loginWithGoogle);

// ✅ Protected route: Get current logged-in user
router.get("/currentUser", authMiddleware,currentUserController);
router.post("/logout",logoutUser);







module.exports=router;