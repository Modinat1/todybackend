const express = require("express");

const router = express.Router();
const todoControllers = require("../controllers/todoControllers");
const verifyToken = require("../middlewares/verifyToken.js");

router.get("/", verifyToken, todoControllers.getTodos);
router.post("/", verifyToken, todoControllers.createTodo);
router.get("/:id", verifyToken, todoControllers.getTodoById);
router.patch("/:id", verifyToken, todoControllers.updateTodoById);
router.delete("/:id", verifyToken, todoControllers.deleteTodoById);

module.exports = router;
