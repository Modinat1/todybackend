const express = require("express");

const router = express.Router();
const commentController = require("../controllers/commentController.js");
const verifyToken = require("../middlewares/verifyToken.js");
const upload = require("../middlewares/uploadImages.js");

router.post("/", upload, verifyToken, commentController.createComment);

router.get("/:id/comment", verifyToken, commentController.getCommentById);
router.patch("/:id", verifyToken, commentController.updateCommentById);
router.delete("/:id", verifyToken, commentController.deleteCommentById);
router.get("/:todoId", verifyToken, commentController.getComments);

module.exports = router;
