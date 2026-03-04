const  {generateGatewayToken} = require("../controllers/gatewayToken.controller");
const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/auth.middleware");

router.get("/generate", authMiddleware, generateGatewayToken);

module.exports = router;