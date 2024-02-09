const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  bookId:{
    type:String
  },
  review:[{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review',
  }]
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
