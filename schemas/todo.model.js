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
    dueDate: {
      type: Date,
      required: true,
    },
    dueTime: {
      type: String,
    },
    dueAt: {
      type: Date, // Full timestamp combining date and time
    },
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

todoSchema.pre("save", function (next) {
  if (this.dueDate && this.dueTime) {
    const [hours, minutes] = this.dueTime.split(":").map(Number);
    const fullDate = new Date(this.dueDate);

    fullDate.setHours(hours);
    fullDate.setMinutes(minutes);
    fullDate.setSeconds(0);
    fullDate.setMilliseconds(0);

    this.dueAt = fullDate;
  }
  next();
});

// ✅ Automatically set `dueAt` when updating (findOneAndUpdate, etc.)
todoSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  // If either dueDate or dueTime is being updated, recompute dueAt
  if (update.dueDate || update.dueTime) {
    const dueDate = update.dueDate ? new Date(update.dueDate) : null;
    const dueTime = update.dueTime || null;

    if (dueDate && dueTime) {
      const [hours, minutes] = dueTime.split(":").map(Number);
      dueDate.setHours(hours);
      dueDate.setMinutes(minutes);
      dueDate.setSeconds(0);
      dueDate.setMilliseconds(0);

      // Ensure dueAt gets added to the update
      this.setUpdate({ ...update, dueAt: dueDate });
    }
  }
  next();
});

todoSchema.plugin(paginate);

const Todo = mongoose.model("todos", todoSchema);

module.exports = Todo;
