const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");

const todoSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Types.ObjectId,
      ref: "users",
      required: true,
    },
    todoTitle: {
      type: String,
      required: [true, "Todo title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    theme: {
      type: String,
      enum: ["blue", "green", "black", "red"],
      required: [true, "Theme is required"],
      trim: true,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: { type: Date, required: true },
    notifiedBeforeDue: { type: Boolean, default: false }, // to prevent duplicate notifications
    status: {
      type: String,
      enum: ["pending", "completed", "overdue"],
      default: "pending",
    },
    comments: [
      {
        type: mongoose.Types.ObjectId,
        ref: "comments",
      },
    ],
    documents: [String],
    photo: [String],
    voicenote: [String],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

todoSchema.plugin(paginate);

const Todo = mongoose.model("todos", todoSchema);

module.exports = Todo;
