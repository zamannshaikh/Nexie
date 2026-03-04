const jwt = require("jsonwebtoken");

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

module.exports = { generateGatewayToken };