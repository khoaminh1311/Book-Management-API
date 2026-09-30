import mongoose from 'mongoose';

const authorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true
  },
  bio: {
    type: String,
    trim: true
  },
  nationality: {
    type: String,
    trim: true
  },
  birthYear: {
    type: Number,
    validate: {
      validator: function(value) {
        if (value === undefined || value === null) return true;
        return Number.isInteger(value) && value > 0 && value <= new Date().getFullYear();
      },
      message: 'Birth year must be a positive integer and cannot be in the future'
    }
  }
}, {
  timestamps: true
});

export default mongoose.model('Author', authorSchema);
