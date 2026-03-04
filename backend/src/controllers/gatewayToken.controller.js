const jwt=require("jsonwebtoken");
const { model } = require("mongoose");



async function generateGatewayToken(req,res) {

    try {
           const gatewayToken = jwt.sign(
    { userId: req.user._id, type: "gateway" }, 
    process.env.JWT_SECRET
  );
  console.log("Generated gateway token:", gatewayToken);
  res.status(200).json({ token: gatewayToken }); 


    } catch (error) {
        res.status(500).json({ error: "Failed to generate gateway token" });
    }

}


model.exports = { generateGatewayToken
}