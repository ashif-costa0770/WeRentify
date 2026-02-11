import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  // Step 1: Media Files
  photos: [{
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    width: Number,
    height: Number,
    format: String
  }],
  
  videos: [{
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    width: Number,
    height: Number,
    format: String,
    duration: Number
  }],

  // Step 2: Item Details
  itemName: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true,
    maxlength: [100, 'Item name cannot exceed 100 characters']
  },
  
  category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true
  },
  
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  
  pickupLocation: {
    type: String,
    required: [true, 'Pickup location is required'],
    trim: true
  },

  coordinates: {
    type: {
      type: String,
      enum: ['Point'], 
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      index: '2dsphere'
    },
    formattedAddress: String,
    _id: false // Disable _id for subdocument
  },

  features: [String],
  rentalRules: [String],

  // Step 3: Pricing
  hourlyRate: {
    type: Number,
    min: [0, 'Hourly rate cannot be negative'],
    default: null
  },
  
  dailyRate: {
    type: Number,
    required: [true, 'Daily rate is required'],
    min: [0, 'Daily rate cannot be negative']
  },
  
  weeklyRate: {
    type: Number,
    min: [0, 'Weekly rate cannot be negative'],
    default: null
  },

  // Step 4: Availability & Delivery
  isAvailable: {
    type: Boolean,
    default: true
  },
  
  offerDelivery: {
    type: Boolean,
    default: false
  },
  
  deliveryFee: {
    type: Number,
    min: [0, 'Delivery fee cannot be negative'],
    default: null
  },

  // Step 5: Payment (for future)
  stripeConnected: {
    type: Boolean,
    default: false
  },
  
  stripeAccountId: {
    type: String,
    default: null
  },

  // Additional fields for marketplace functionality
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true 
  },

  views: {
    type: Number,
    default: 0
  },

  bookings: {
    type: Number,
    default: 0
  },

  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },

  reviewCount: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: ['active', 'inactive', 'rented', 'under_maintenance'],
    default: 'active'
  }

}, {
  timestamps: true, // Adds createdAt and updatedAt automatically
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
listingSchema.index({ category: 1, isAvailable: 1 });
listingSchema.index({ dailyRate: 1 });
listingSchema.index({ createdAt: -1 });
listingSchema.index({ itemName: 'text', description: 'text' }); // For text search

// Virtual for calculating average daily rate if weekly rate exists
listingSchema.virtual('effectiveDailyRate').get(function() {
  if (this.weeklyRate) {
    return Math.min(this.dailyRate, this.weeklyRate / 7);
  }
  return this.dailyRate;
});

// Pre-save middleware to auto-calculate weekly rate if not provided
listingSchema.pre('save', function(next) {
  if (this.dailyRate && !this.weeklyRate) {
    this.weeklyRate = Math.round(this.dailyRate * 7 * 0.85); // 15% discount
  }
  next();
});

// Method to increment views
listingSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Static method to find available listings
listingSchema.statics.findAvailable = function(filters = {}) {
  return this.find({ isAvailable: true, status: 'active', ...filters });
};

const Listing = mongoose.model('Listing', listingSchema);

export default Listing;