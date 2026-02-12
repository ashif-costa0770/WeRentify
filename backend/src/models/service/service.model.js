import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({

    // Step 1: Business Details
    businessName:{
        type: String,
        required: true,
        trim: true,
    },
    serviceType:{
        type: String,
        required: true,
        trim: true,
    },
    category:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
    },
    yearsInBusiness:{
        type:Number,
        required: true,
        default: 0,
    },
    description:{
        type: String,
        required: true,
        trim: true,
    },

     // Step 2: Contact Details
     location:{
        type: String,
        required: true,
        trim: true,
     },
     serviceRadius: {
        type : Number,
        required: true,
        default: 0,
     },
     phone:{
        type: String,
        required: true,
        trim: true,
     },
     email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,                                                                                                                                             
     },
     website: {
        type: String,
        trim: true,
        lowercase: true,
     },
     certifications: {
        type: String,
        trim: true,
     },

     // Step 3: Showcase Your work
     photos: [{
        public_id:{
            type: String,
            required: true,
        },
        url:{
            type: String,
            required: true,
        },
        width: Number,
        height: Number,
        format: String,
     }],
     
     videos: [{
        public_id:{
            type: String,
            required: true,
        },
        url:{
            type: String,
            required: true,
        },
        width: Number,
        height: Number,
        format: String,
        duration: Number,
     }],
     
     hourlyRate: {
        type: String,
        required: true,
     },

     icon:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        //   required: true,
     },

     // Step 4: Choose a Plan
     plan:{
        type: String,
        required: true,
        enum: ['basic', 'plus', 'pro'],
        default: 'basic',
     },

     // Step 5: Owner Details
     owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      //   required: true,
     },
     views: {
        type: Number,
        default: 0,
     },
     bookings: {
        type: Number,
        default: 0,
     },

     rating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
     },
     reviewCount: {
        type: Number,
        default: 0,
     },
     status: {
        type: String,
        enum: ['active', 'inactive', 'under_maintenance', 'pending_verification'],
        default: 'active',
     },
     verified:{
      type:Boolean,
      default:false
     }
}, { timestamps: true });

// Indexes for better query performance
serviceSchema.index({ category: 1, status: 1 });

const Service = mongoose.model('Service', serviceSchema);
export default Service;