const express = require("express");

const router = express.Router();
const todoControllers = require("../controllers/todoControllers");
const verifyToken = require("../middlewares/verifyToken.js");
// const uploadImages = require("../middlewares/uploadImages.js")

router.get("/", verifyToken, todoControllers.getTodos);
router.post("/", verifyToken, todoControllers.createTodo);
router.post("/:id/comment", verifyToken, todoControllers.addComment);
router.get("/:id", verifyToken, todoControllers.getTodoById);
router.patch("/:id", verifyToken, todoControllers.updateTodoById);
router.delete("/:id", verifyToken, todoControllers.deleteTodoById);
// router.post("/:id/upload-image", verifyToken, uploadImages, todoControllers.uploadImages);

module.exports = router;
