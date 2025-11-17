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
      type: String,
      required: true,
    },

    dueAt: {
      type: Date,
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

// Convert Nigerian local date + time → real UTC Date
function nigerianToUTC(dueDate, dueTime) {
  const date = moment(dueDate).format("YYYY-MM-DD"); // Ensure date only
  const combined = `${date} ${dueTime}`; // "2025-11-17 16:15"

  // Parse as Nigeria time and convert to UTC
  const utcDate = moment.tz(combined, "YYYY-MM-DD HH:mm", NIGERIA_TZ).utc();

  return utcDate.toDate();
}

// When creating a new todo – auto-generate dueAt
todoSchema.pre("save", function (next) {
  if (this.dueDate && this.dueTime) {
    this.dueAt = nigerianToUTC(this.dueDate, this.dueTime);
  }
  next();
});

// When updating (findOneAndUpdate) – recompute dueAt only if needed
todoSchema.pre("findOneAndUpdate", function (next) {
  const update = this.getUpdate();

  const hasDueDate = update.dueDate !== undefined;
  const hasDueTime = update.dueTime !== undefined;

  if (hasDueDate || hasDueTime) {
    // Retrieve current values OR updated values
    const dueDate = hasDueDate
      ? new Date(update.dueDate)
      : this._update.$set?.dueDate;
    const dueTime = hasDueTime ? update.dueTime : this._update.$set?.dueTime;

    if (dueDate && dueTime) {
      update.dueAt = nigerianToUTC(dueDate, dueTime);
      this.setUpdate(update);
    }
  }
  next();
});

todoSchema.plugin(paginate);

const Todo = mongoose.model("todos", todoSchema);
module.exports = Todo;
