const express = require("express");
const router = express.Router();
const { savePushToken } = require("../controllers/userController.js");
const verifyToken = require("../middlewares/verifyToken.js");

router.post("/push-token", verifyToken, savePushToken);

module.exports = router;
