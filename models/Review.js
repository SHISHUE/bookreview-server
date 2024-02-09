const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
 
  },
  comments:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Comment"
  }],
  rating: {
    type: Number,
  },
  text: {
    type: String
  }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
