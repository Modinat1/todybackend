const todoModel = require("../schemas/todo.model.js");

const getTodos = async (req, res) => {
  try {
    const todos = await todoModel.find({ userId: req.user.userId });

    res.status(200).json({
      message: "Todos fetched successfully",
      todos,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching todos", error: error.message });
  }
};

const getTodoById = async (req, res) => {
  try {
    const { id } = req.params;

    const todo = await todoModel.findOne({ _id: id, userId: req.user.userId });

    if (!todo) {
      res.status(404).json({
        message: "Todo not found",
      });
      return;
    }

    res.status(200).json({
      message: "Todo fetched successfully",
      todo,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching todo", error: error.message });
  }
};

const createTodo = async (req, res) => {
  try {
    const { todoTitle, description, theme, status } = req.body;

    const todo = await todoModel.create({
      todoTitle,
      description,
      theme,
      status,
      userId: req.user.userId,
    });

    res.status(201).json({
      message: "Todo created successfully",
      todo,
    });
  } catch (error) {
    res.status(400).json({
      message: "Error creating todo",
      error: error.message || error,
    });
  }
};

const updateTodoById = async (req, res) => {
  try {
    const { id } = req.params;

    const { theme, ...fieldsToUpdate } = req.body;

    const UpdatedTodo = await todoModel.findOneAndUpdate(
      { _id: id, userId: req.user.userId },
      fieldsToUpdate,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!UpdatedTodo) {
      res.status(404).json({
        message: "Todo not found",
      });
      return;
    }

    res.status(200).json({
      message: "Todo updated successfully",
      UpdatedTodo,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating todo", error: error.message });
  }
};

const deleteTodoById = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedTodo = await todoModel.findOneAndDelete({
      _id: id,
      userId: req.user.userId,
    });

    if (!deletedTodo) {
      res.status(404).json({
        message: "Todo not found",
      });
      return;
    }

    res.status(200).json({
      message: "Todo deleted successfully",
      deletedTodo,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting todo", error: error.message });
  }
};

module.exports = {
  getTodos,
  createTodo,
  getTodoById,
  updateTodoById,
  deleteTodoById,
};

// "todoTitle": "Code today",
// "description": "I want to do and sleep again",
// "theme": "#343547",
