const mongoose = require("mongoose");
const paginate = require("mongoose-paginate-v2");

const commentSchema = new mongoose.Schema(
  {
    todoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "todos",
      required: true,
    },
    commenterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    commenterText: String,
    attachments: [
      {
        type: {
          type: String,
          enum: ["photo", "document", "voice"],
        },
        url: String,
        meta: mongoose.Schema.Types.Mixed,
      },
    ],
  },
  { timestamps: true }
);

commentSchema.plugin(paginate);

const Comments = mongoose.model("comments", commentSchema);

module.exports = Comments;
