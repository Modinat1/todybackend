const express = require("express");
const router = express.Router();
const { savePushToken } = require("../controllers/userController.js");

router.post("/push-token", savePushToken);

module.exports = router;
