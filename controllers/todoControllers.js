const mongoose = require("mongoose");
const todoModel = require("../schemas/todo.model.js");

// const getTodos = async (req, res) => {
//   try {
//     const { page, limit, status } = req.query;

//     const filter = { userId: req.user.userId };
//     if (status && ["pending", "completed", "overdue"].includes(status)) {
//       filter.status = status;
//     }

//     const todos = await todoModel.paginate(
//       filter,
//       { userId: req.user.userId },
//       {
//         page: (page && isNaN(page)) == false ? parseInt(page) : 1,
//         limit: (limit && isNaN(limit)) == false ? parseInt(limit) : 4,
//         populate: [
//           {
//             path: "comments",
//             select: "commenterId commenterText attachments createdAt",
//           },
//         ],
//         sort: { createdAt: -1 },
//       }
//     );

//     res.status(200).json({
//       message: "Todos fetched successfully",
//       todos: todos.docs,
//       pagination: {
//         totalDocs: todos.totalDocs,
//         limit: todos.limit,
//         page: todos.page,
//         totalPages: todos.totalPages,
//         hasNextPage: todos.hasNextPage,
//         hasPrevPage: todos.hasPrevPage,
//       },
//     });

//   } catch (error) {
//     res
//       .status(500)
//       .json({ message: "Error fetching todos", error: error.message });
//   }
// };

const getTodos = async (req, res) => {
  try {
    const { cursor, limit = 10, status } = req.query;

    const filter = { userId: req.user.userId };

    if (status && ["pending", "completed", "overdue"].includes(status)) {
      filter.status = status;
    }

    // If a cursor is provided, fetch todos created before that cursor
    if (cursor) {
      filter.createdAt = { $lt: new Date(cursor) };
    }

    const todos = await todoModel
      .find(filter)
      .populate({
        path: "comments",
        select: "commenterId commenterText attachments createdAt",
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) + 1); // fetch one extra to detect next page

    // Determine the next cursor
    const hasNextPage = todos.length > limit;
    const nextCursor = hasNextPage ? todos[limit - 1].createdAt : null;

    // Trim to the requested limit
    const results = hasNextPage ? todos.slice(0, limit) : todos;

    res.status(200).json({
      message: "Todos fetched successfully",
      todos: results,
      nextCursor,
      hasNextPage,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching todos",
      error: error.message,
    });
  }
};

const getTodoById = async (req, res) => {
  try {
    const { id } = req.params;

    const todo = await todoModel
      .findOne({ _id: id, userId: req.user.userId })
      .populate({
        path: "comments",
        populate: { path: "commenterId", select: "userName email" },
      });

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
    const { todoTitle, description, theme, status, dueDate, dueTime } =
      req.body;

    const todo = await todoModel.create({
      todoTitle,
      description,
      theme,
      status,
      dueDate,
      dueTime,
      userId: req.user.userId,
    });

    res.status(201).json({
      message: "Todo created successfully",
      todo,
    });
  } catch (error) {
    console.log(error);

    res.status(400).json({
      message: "Error creating todo",
      error: error.message || error,
    });
  }
};

const updateTodoById = async (req, res) => {
  try {
    const { id } = req.params;

    const { theme, comment, ...fieldsToUpdate } = req.body;

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

const updateTodoStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid todo ID format" });
    }

    if (!["pending", "completed", "overdue"].includes(status)) {
      return res.status(400).json({ message: "invalid status value" });
    }

    const updatedTodo = await todoModel.findOneAndUpdate(
      {
        _id: id,
        userId: req.user.userId,
      },
      { status },
      { new: true, runValidators: true }
    );
    if (!updatedTodo) {
      return res.status(404).json({ message: "Todo not found!" });
    }
    res.status(200).json({
      message: "Todo status updated successfully",
      updatedTodo: updatedTodo,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating todo status", error: error.message });
  }
};

module.exports = {
  getTodos,
  createTodo,
  getTodoById,
  updateTodoById,
  deleteTodoById,
  updateTodoStatus,
};
