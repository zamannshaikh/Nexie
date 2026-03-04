const  {generateGatewayToken,shutdownGateway} = require("../controllers/gatewayToken.controller");
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/generate", authMiddleware, generateGatewayToken);
router.post("/shutdown", authMiddleware, shutdownGateway);

module.exports = router;