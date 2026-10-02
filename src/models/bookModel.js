import mongoose from 'mongoose';
import { isValidPastYear } from '../utils/validators.js';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  genre: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    min: [0, 'Price cannot be negative'],
  },
  publishedYear: {
    type: Number,
    validate: {
      validator: isValidPastYear,
      message: 'Published year must be a positive integer and cannot be in the future'
    }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: [true, 'Author is required']
  }
}, {
  timestamps: true
});

export default mongoose.model('Book', bookSchema);
