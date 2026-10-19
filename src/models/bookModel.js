import mongoose from 'mongoose';
import { isValidPastYear, isValidUrl } from '../utils/validators.js';

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
    maxlength: [5000, 'Description content (including formatting tags) cannot exceed 5000 characters']
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
    required: [true, 'Published year is required'],
    validate: {
      validator: isValidPastYear,
      message: 'Published year must be an integer between 1000 and the current year'
    }
  },
  coverImage: {
    type: String,
    trim: true,
    maxlength: [500, 'Cover image URL cannot exceed 500 characters'],
    validate: {
      validator: isValidUrl,
      message: 'Cover image must be a valid HTTP or HTTPS URL'
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
