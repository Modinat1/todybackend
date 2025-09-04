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
    status: {
      type: String,
      enum: ["pending", "completed", "overdue"],
      default: "pending",
    },
    comment: [
      {
        commenterId: {
          type: mongoose.Types.ObjectId,
          ref: "users",
        },
        commenterText: {
          type: String,
          required: [true, "comment is required"],
          trim: true,
        },
        commentedAt: {
          type: Date,
          default: Date.now,
        },
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
