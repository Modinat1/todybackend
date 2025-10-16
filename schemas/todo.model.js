const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");
const moment = require("moment-timezone");

const NIGERIA_TZ = "Africa/Lagos";

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
      type: String, // Format: "HH:MM" in Nigerian time
    },
    dueAt: {
      type: Date, // Stored in UTC, represents Nigerian time
    },
    notifiedBeforeDue: { type: Boolean, default: false },
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

// ✅ Helper to convert Nigerian time to UTC Date object
function nigerianToUTC(dueDate, dueTime) {
  const dateStr = moment(dueDate).format("YYYY-MM-DD");
  const dateTimeStr = `${dateStr} ${dueTime}`;

  // Parse as Nigerian time and convert to UTC
  return moment.tz(dateTimeStr, "YYYY-MM-DD HH:mm", NIGERIA_TZ).toDate();
}

// ✅ Automatically set `dueAt` when creating a new todo
todoSchema.pre("save", function (next) {
  if (this.dueDate && this.dueTime) {
    this.dueAt = nigerianToUTC(this.dueDate, this.dueTime);
  }
  next();
});

// ✅ Automatically set `dueAt` when updating (findOneAndUpdate, etc.)
todoSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  if (update.dueDate || update.dueTime) {
    const dueDate = update.dueDate ? new Date(update.dueDate) : null;
    const dueTime = update.dueTime || null;

    if (dueDate && dueTime) {
      this.setUpdate({ ...update, dueAt: nigerianToUTC(dueDate, dueTime) });
    }
  }
  next();
});

todoSchema.plugin(paginate);

const Todo = mongoose.model("todos", todoSchema);

module.exports = Todo;
