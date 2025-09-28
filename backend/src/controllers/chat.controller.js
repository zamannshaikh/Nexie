const chatModel = require('../models/chat.model');


async function createChat(req, res) {
    const { title } = req.body;
    const userId = req.user._id;

    try {
        const newChat = new chatModel({
            user: userId,
            title
        });
        await newChat.save();
        res.status(201).json({ message: "Chat created successfully", chat: newChat });
        console.log("New chat created:", newChat);
    } catch (error) {
        console.error("Error in creating chat:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}



module.exports = { createChat };