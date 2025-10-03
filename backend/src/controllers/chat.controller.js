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






async function getUserChats(req, res) {
    const user = req.user._id;
    console.log("Searching for chats for user ID:", user);

    try {
        // The fix is here: { user: user }
        const chats = await chatModel.find({ user: user }).sort({ createdAt: -1 });
        
        console.log("Chats fetched:", chats); // This should now show your chats
        res.json(chats);
    } catch (error) {
        console.error("Error fetching chats:", error); // It's good practice to log the error
        res.status(500).json({ message: 'Server Error' });
    }
}







async function deleteChat(req,res) {
       try {
        const chat = await Chat.findById(req.params.id);
        if (!chat) {
            return res.status(404).json({ message: 'Chat not found' });
        }
        // Security check uses req.user
        if (chat.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        await chat.deleteOne();
        res.json({ message: 'Chat removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
    
}


module.exports = { createChat ,getUserChats,deleteChat};