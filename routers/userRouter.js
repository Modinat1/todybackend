const express = require("express");
const router = express.Router();
const {
  savePushToken,
  getUserProfile,
  updateUserProfile,
} = require("../controllers/userController.js");
const verifyToken = require("../middlewares/verifyToken.js");

router.get("/", verifyToken, getUserProfile);
router.patch("/", verifyToken, updateUserProfile);
router.post("/push-token", verifyToken, savePushToken);

module.exports = router;
