const  generateGatewayToken = require("../controllers/gatewayToken.controller");
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");

router.post("/generate", authMiddleware, generateGatewayToken);

module.exports = router;