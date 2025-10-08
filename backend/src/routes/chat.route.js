const authMiddleware=require("../middlewares/auth.middleware");
const {createChat,getUserChats,getMessages,updateChatTitle}=require("../controllers/chat.controller"); 
const express=require("express");
const router=express.Router();


router.post("/createchat",authMiddleware,createChat);
router.get("/getchats",authMiddleware,getUserChats);
router.get("/messages/:id",authMiddleware,getMessages);
router.patch('/updatechat/:chatId', authMiddleware, updateChatTitle);

module.exports=router;
