import mongoose from 'mongoose';
import { isValidPastYear } from '../utils/validators.js';

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  bio: {
    type: String,
    trim: true,
    maxlength: [2000, 'Bio cannot exceed 2000 characters']
  },
  nationality: {
    type: String,
    trim: true
  },
  birthYear: {
    type: Number,
    validate: {
      validator: isValidPastYear,
      message: 'Birth year must be a positive integer and cannot be in the future'
    }
  }
}, {
  timestamps: true
});

export default mongoose.model('Author', authorSchema);
