import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  genre: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    min: [0, 'Price cannot be negative']
  },
  publishedYear: {
    type: Number,
    validate: {
      validator: function(value) {
        if (value === undefined || value === null) return true;
        return value > 0 && value <= new Date().getFullYear();
      },
      message: 'Published year must be a positive integer and cannot be in the future'
    }
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Author',
    required: [true, 'Author is required']
  }
}, {
  timestamps: true // This option automatically adds createdAt and updatedAt fields
});

export default mongoose.model('Book', bookSchema);
