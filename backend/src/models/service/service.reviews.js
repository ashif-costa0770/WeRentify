import mongoose from 'mongoose';

const serviceReviewSchema = new mongoose.Schema({
    service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Service',
        required: true,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5,
    },
    comment: {
        type: String,
        // required: true,
    },
}, { timestamps: true });

const ServiceReview = mongoose.model('ServiceReview', serviceReviewSchema);
export default ServiceReview;