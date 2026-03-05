const  {generateGatewayToken,shutdownGateway,getGatewayStatus} = require("../controllers/gatewayToken.controller");
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/generate", authMiddleware, generateGatewayToken);
router.post("/shutdown", authMiddleware, shutdownGateway);
router.get("/status", authMiddleware, getGatewayStatus);

module.exports = router;