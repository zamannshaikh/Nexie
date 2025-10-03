const authMiddleware=require("../middlewares/auth.middleware");
const {createChat,getUserChats}=require("../controllers/chat.controller"); 
const express=require("express");
const router=express.Router();


router.post("/createchat",authMiddleware,createChat);
router.get("/getchats",authMiddleware,getUserChats)

module.exports=router;
