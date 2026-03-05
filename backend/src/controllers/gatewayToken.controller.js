const jwt = require("jsonwebtoken");
const { getIo } = require("../sockets/socket.server"); // Adjust path if needed!

const generateGatewayToken = async (req, res) => {
  try {
    // Check if the auth middleware attached the user object
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    // Generate the long-lasting token
    const gatewayToken = jwt.sign(
      { userId: req.user._id, type: "gateway" },
      process.env.JWT_SECRET
    );

    res.status(200).json({ token: gatewayToken });
  } catch (error) {
    console.error("Error generating gateway token:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};



const shutdownGateway = async (req, res) => {
  try {
    console.log("Received shutdown request from user:", req.user ? req.user._id : "Unknown");
    // 1. Ensure the user is authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const userId = req.user._id.toString();
    console.log(`Attempting to shut down gateway for user: ${userId}`);
    
    // 2. Get the active Socket.io instance
    // Note: This assumes you attached 'io' to your Express app. 
    // If you export 'io' differently, import it at the top of this file!
   const io = getIo(); 
    console.log("Socket.io instance retrieved successfully!", io ? "Yes" : "No");

    if (!io) {
      return res.status(500).json({ error: "Socket server not initialized" });
    }

    let gatewayFound = false;

    // 3. Loop through all connected sockets to find this user's gateway
    for (let [id, socket] of io.sockets.sockets) {
      if (socket.isGateway && socket.gatewayUserId === userId) {
        
        console.log(`🛑 Sending shutdown signal to Gateway for user: ${userId}`);
        
        // Emit the kill signal to the Rust app
        socket.emit("execute_command", { command: "NEXIE_SHUTDOWN_SIGNAL" });

       
        

        
        gatewayFound = true;
        break; // Stop searching once we found and killed it
      }
    }

    if (gatewayFound) {
      console.log(`✅ Gateway shutdown initiated for user: ${userId}`);
      return res.status(200).json({ message: "Machine shutdown successfully." });
      
    } else {
      console.log(`⚠️ No active gateway found for user: ${userId}`);
      return res.status(404).json({ message: "No active machine connected." });
    }

  } catch (error) {
    console.error("Error shutting down gateway:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};




const getGatewayStatus = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const userId = req.user._id.toString();
    const io = getIo(); 
    let isActive = false;

    // Search for the user's active socket
    for (let [id, socket] of io.sockets.sockets) {
      if (socket.isGateway && socket.gatewayUserId === userId) {
        isActive = true;
        break;
      }
    }

    return res.status(200).json({ active: isActive });

  } catch (error) {
    console.error("Error checking gateway status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};


module.exports = { generateGatewayToken, shutdownGateway ,getGatewayStatus};