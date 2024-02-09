const mongoose = require('mongoose');
const Book = require('../models/Book');
const Review = require('../models/Review');
const User = require("../models/User")

exports.createReview = async(req, res) => {
    try {
        const { text, email, title, bookId } = req.body;
        const userId = req.user.id;

        if (!text || !email || !title || !bookId) {
            return res.status(404).json({
                success: false,
                message: "Fill all data"
            });
        }

        let book = await Book.findOne({ bookId: bookId });

        if (!book) {
            book = await Book.create({ title: title, bookId: bookId, reviews: [] });
        }

        const review = await Review.create({
            text: text,
            user: userId,
            book: book._id
        });

        await User.findByIdAndUpdate(
            { _id: userId },
            {
                $push: {
                    reviews: review._id,
                },
            },
            { new: true }
        );

        // Update or push the review id to the book's reviews array
        if (book.review) {
            book.review.push(review._id);
        } else {
            book.review = [review._id];
        }

        await book.save();

        return res.status(200).json({
            success: true,
            message: "Rating and review created successfully",
            data: review,
        });

    } catch (error) {
        console.log("error", error.message)
        return res.status(500).json({
            success: false,
            message: "Review not created",
            error: error.message
        });
    }
}


exports.getReview = async (req, res) => {
    try {
      const { bookId } = req.params;
      console.log("INSIDE BACKEND", bookId);
  
      if (!bookId) {
        return res.status(401).json({
          success: false,
          message: "Provide book id",
        });
      }
  
      const review = await Book.findOne({ bookId: bookId }).populate({
        path: "review",
        populate: [
          { path: "user" }, // Populate the 'user' field inside 'review' model
          { path: "book" }, // Populate the 'book' field inside 'review' model
          { path: "comments", populate: { path: "user" } }, // Populate the 'comments' field inside 'review' model and then populate the 'user' field inside 'comments'
        ],
      });
  
      return res.status(200).json({
        success: true,
        data: review,
        message: "Successfully get reviews",
      });
    } catch (error) {
      console.error("Error:", error.message);
      return res.status(500).json({
        success: false,
        message: "Failed to get review",
        error: error.message,
      });
    }
  };

  

exports.editReview = async (req, res) => {
    try {
        const { newText, reviewId } = req.body;

        if (!newText) {
            return res.status(400).json({
                success: false,
                message: "Text and rating are required"
            });
        }

        const updatedReview = await Review.findByIdAndUpdate(
            reviewId,
            { text: newText},
            { new: true }
        );

        if (!updatedReview) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Review updated successfully",
            data: updatedReview
        });

    } catch (error) {
        console.error("Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to update review",
            error: error.message
        });
    }
};

exports.deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.body;
        console.log("INSIDE DEL", req.body)

        // Validate reviewId
        if (!mongoose.Types.ObjectId.isValid(reviewId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid reviewId"
            });
        }

        const deletedReview = await Review.findByIdAndDelete(reviewId);

        if (!deletedReview) {
            return res.status(404).json({
                success: false,
                message: "Review not found"
            });
        }

        // Remove the review ID from associated book and user
        await Book.updateOne(
            { reviews: reviewId },
            { $pull: { reviews: reviewId } }
        );

        await User.updateOne(
            { reviews: reviewId },
            { $pull: { reviews: reviewId } }
        );

        return res.status(200).json({
            success: true,
            message: "Review deleted successfully",
        });

    } catch (error) {
        console.error("Error:", error.message);
        return res.status(500).json({
            success: false,
            message: "Failed to delete review",
            error: error.message
        });
    }
};


