const Comment = require("../models/Comment");
const Review = require("../models/Review");
const User = require("../models/User");

exports.createComment = async (req, res) => {
  try {
    const { text, reviewId } = req.body;
    const userId = req.user.id;

    if (!text || !reviewId) {
      return res.status(400).json({
        success: false,
        message: "Text and review ID are required",
      });
    }

    const comment = await Comment.create({
      text: text,
      review: reviewId,
      user: userId,
    });

    await Review.findByIdAndUpdate(
      { _id: reviewId },
      {
        $push: {
          comments: comment._id,
        },
      },
      { new: true }
    );

    await User.findByIdAndUpdate(
      { _id: userId },
      {
        $push: {
          comments: comment._id,
        },
      },
      { new: true }
    );

    return res.status(201).json({
      success: true,
      message: "Comment created successfully",
      data: comment,
    });
  } catch (error) {
    console.error("Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to create comment",
      error: error.message,
    });
  }
};

exports.editComment = async (req, res) => {
    try {
        const { text, commentId } = req.body;

        if (!text || !commentId) {
            return res.status(400).json({
                success: false,
                message: "Text and comment ID are required"
            });
        }

        const updatedComment = await Comment.findByIdAndUpdate(
            commentId,
            { text: text },
            { new: true }
        );

        if (!updatedComment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Comment updated successfully",
            data: updatedComment
        });

    } catch (error) {
        console.error("Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to update comment",
            error: error.message
        });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const { commentId } = req.body;

        const deletedComment = await Comment.findByIdAndDelete(commentId);

        if (!deletedComment) {
            return res.status(404).json({
                success: false,
                message: "Comment not found"
            });
        }

        // Remove the comment ID from associated review and user
        await Review.updateOne(
            { comments: commentId },
            { $pull: { comments: commentId } }
        );

        await User.updateOne(
            { comments: commentId },
            { $pull: { comments: commentId } }
        );

        return res.status(200).json({
            success: true,
            message: "Comment deleted successfully"
        });

    } catch (error) {
        console.error("Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to delete comment",
            error: error.message
        });
    }
};
