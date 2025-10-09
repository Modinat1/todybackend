require("../schemas/user.model.js");
const todoModel = require("../schemas/todo.model.js");
const commentModel = require("../schemas/comment.model.js");
const uploadFile = require("../utils/fileUpload.js");

const getComments = async (req, res) => {
  try {
    const { todoId, page, limit } = req.params;

    // const comments = await commentModel.paginate(
    //   { todoId },
    //   {
    //     page: (page && isNaN(page)) == false ? parseInt(page) : 1,
    //     limit: (limit && isNaN(limit)) == false ? parseInt(limit) : 4,
    //     populate: [
    //       {
    //         path: "commenterId",
    //         select: "userName",
    //       },
    //     ],
    //     lean: false,
    //   }
    // );

    const comments = await commentModel
      .find({ todoId })
      .populate("commenterId", "userName")
      .exec();

    res.status(200).json({
      message: "Comments fetched successfully",
      comments: comments,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching comments", error: error.message });
  }
};

const getCommentById = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await commentModel
      .findById(id)
      .populate("commenterId", "userName commenterText");

    if (!comment) {
      res.status(404).json({
        message: "Comment not found",
      });
      return;
    }

    res.status(200).json({
      message: "Comment fetched successfully",
      comment,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching comment", error: error.message });
  }
};

const createComment = async (req, res) => {
  try {
    const { todoId, commenterText } = req.body;

    const uploadedAttachments = await Promise.all(
      (req.files || []).map(async (file) => {
        const url = await uploadFile(file);
        // you decide type based on file.mimetype
        let type = "photo";
        if (file.mimetype.startsWith("image/")) type = "photo";
        else if (file.mimetype.startsWith("audio/")) type = "voice";
        else type = "document";

        return {
          type,
          url,
          meta: {
            originalName: file.originalname,
            size: file.size,
            mime: file.mimetype,
          },
        };
      })
    );

    const comment = await commentModel.create({
      commenterText,
      attachments: uploadedAttachments,
      commenterId: req.user.userId,
      todoId,
    });

    await todoModel.findByIdAndUpdate(todoId, {
      $push: { comments: comment._id },
    });

    res.status(201).json({
      message: "Comment created successfully",
      comment,
    });
  } catch (error) {
    console.log(error);

    res.status(400).json({
      message: "Error creating comment",
      error: error.message || error,
    });
  }
};

const updateCommentById = async (req, res) => {
  try {
    const { id } = req.params;

    const { commenterText, attachments } = req.body;

    const update = {};
    if (commenterText) update.commenterText = commenterText;
    if (attachments) update.attachments = attachments;

    const updatedComment = await commentModel.findOneAndUpdate(
      { _id: id, commenterId: req.user.userId },
      update,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedComment) {
      res.status(404).json({
        message: "Comment not found",
      });
      return;
    }

    res.status(200).json({
      message: "Comment updated successfully",
      updatedComment,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating comment", error: error.message });
  }
};

const deleteCommentById = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedComment = await commentModel.findOneAndDelete({
      _id: id,
      commenterId: req.user.userId,
    });

    if (!deletedComment) {
      res.status(404).json({
        message: "Comment not found",
      });
      return;
    }

    res.status(200).json({
      message: "Comment deleted successfully",
      deletedComment,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting comment", error: error.message });
  }
};

module.exports = {
  getComments,
  getCommentById,
  createComment,
  updateCommentById,
  deleteCommentById,
};
