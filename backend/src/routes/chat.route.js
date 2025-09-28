const authMiddleware=require("../middlewares/auth.middleware");
const {createChat}=require("../controllers/chat.controller"); 
const express=require("express");
const router=express.Router();


router.post("/",authMiddleware,createChat);

module.exports=router;
