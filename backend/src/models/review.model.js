import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Comment is required'],
    trim: true,
    maxlength: 500
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming you have a User model or will have one
    // required: true
  },
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    // required: true
  }
}, {
  timestamps: true
});

// Prevent user from reviewing the same listing twice
reviewSchema.index({ author: 1, listing: 1 }, { unique: true });

const Review = mongoose.model('Review', reviewSchema);

export default Review;
