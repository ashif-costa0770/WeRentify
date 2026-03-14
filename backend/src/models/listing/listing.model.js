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
    required:true,
    trim: true,
    maxlength: 100
  },
  
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true 
  },
  
  description: {
    type: String,
    required:true,
    trim: true,
    maxlength:5000
  },
  
  pickupLocation: {
    type: String,
    required:true,
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

  features: [String] ,
  rentalRules: [String] ,

  cancellationPolicy :{
    type:String,
  },

  // Step 3: Pricing
  hourlyRate: {
    type: Number,
    min: 0,
    default: null
  },
  
  dailyRate: {
    type: Number,
    required: true,
    min : 0
  },
  
  weeklyRate: {
    type: Number,
    min : 0,
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
     min : 0,
    default: null
  },

  // Step 5: Payment (for future)

  stripePriceId: {
    type: String,
    required: true,
  },

  stripeProductId: {
    type: String,
    required: true,
  },

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
  },
  // for featured listings
  isFeatured: {
    type: Boolean,
    default: false
  },
  featuredUntil: {
    type: Date,
    default: null
  },
  verified: {     // for admin verification
    type: Boolean,
    default: true
  }

}, {
  timestamps: true
});

// Indexes for better query performance
listingSchema.index({ dailyRate: 1 });
listingSchema.index({ isFeatured: 1, featuredUntil: 1 });
listingSchema.index({ createdAt: -1 });
listingSchema.index({ pickupLocation: 1 });
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

const Listing = mongoose.model('Listing', listingSchema);
export default Listing;