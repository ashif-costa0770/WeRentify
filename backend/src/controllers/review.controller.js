import Review from "../models/review.model.js";
import Booking from "../models/booking.model.js";
import Listing from "../models/listing/listing.model.js";
import Service from "../models/service/service.model.js";
import { errorResponse, successResponse } from "../utils/response.js";

//  updateReviewStats : This function collects all reviews of a listing/service,
//   calculates the average rating and total review count, and updates the listing/service document with the new values.
const updateReviewStats = async (targetId, targetModel) => {
    const stats = await Review.aggregate([
      {
        $match: {
          target: targetId,
          targetModel,
          isVisible: true,
        },
      },
      {
        $group: {
          _id: "$target",
          avgRating: { $avg: "$rating" },
          count: { $sum: 1 },
        },
      },
    ]);
  
    const data = {
      rating: stats[0]?.avgRating || 0,
      reviewCount: stats[0]?.count || 0,
    };
    if (targetModel === "Listing") {
      await Listing.findByIdAndUpdate(targetId, data);
    } else {
      await Service.findByIdAndUpdate(targetId, data);
    }
  };

//! Create review
export const createReview = async (req, res) =>{
    try {
        const {bookingId, rating, comment} = req.body;

        const booking = await Booking.findById(bookingId);
        if(!booking){
            return errorResponse(res, 404, "Booking not found");
        }

         /* Check booking belongs to user */
         if(booking.customer.toString() !== req.user._id.toString()){
            return errorResponse(res, 403, "You are not authorized to create a review for this booking");
         }
         /* Check booking is completed */
         if(booking.status !== "completed"){
            return errorResponse(res, 400, "Booking is not completed yet");
         }

         /* Check if review already exists */
         const existingReview = await Review.findOne({booking: bookingId})
         if(existingReview){
            return errorResponse(res, 400, "Review already exists");
         }

         /* Create review */
         const review = await Review.create({
            booking: bookingId,
            author : req.user._id,
            rating,
            comment,
            target: booking.resource,
            targetModel: booking.resourceModel,
         })

         /* Update review stats */
         await updateReviewStats(booking.resource._id, booking.resourceModel)

         return successResponse(res, 201, "Review created successfully", review);
    } catch (error) {
        return errorResponse(res, 500, "Internal server error", error.message);
    }
}

//! Get all reviews
export const getAllReviews = async (req, res) => {
    try {
        const {targetId, targetModel} = req.query;

        if(!targetId || !targetModel){
            return errorResponse(res, 400, "Resource ID and resource model are required");
        }
        const [reviews, total] = await Promise.all([
            Review.find({
            target: targetId,
            targetModel: targetModel,
            isVisible: true,
        }).populate("author","email firstname lastname avatar").sort({createdAt: -1}).lean(),

        Review.countDocuments({
            target: targetId,
            targetModel: targetModel,
            isVisible: true,
        })
    ]);

        if(reviews.length === 0){
            return successResponse(res, 200, "No reviews found",
            {
                reviews: [],
                totalReviews: 0,
            });
        }

        return successResponse(res, 200, "All reviews fetched successfully", {
            reviews,
            totalReviews: total,
        });
        
    } catch (error) {
        return errorResponse(res, 500, "Internal server error", error.message);
        
    }
}

//! Update review
export const updateReview = async (req, res) => {
    try {
        const {reviewId} = req.params;
        const {rating, comment} = req.body;

        const review = await Review.findById(reviewId);
        if(!review){
            return errorResponse(res, 404, "Review not found");
        }

        /* Check if review belongs to user */
        if(review.author.toString() !== req.user._id.toString()){
            return errorResponse(res, 403, "You are not authorized to update this review");
        }
        //update review
        review.rating = rating;
        review.comment = comment;

        await review.save();

        /* Recalculate rating */
        await updateReviewStats(review.target, review.targetModel);

        return successResponse(res, 200, "Review updated successfully", review );
    } catch (error) {
        return errorResponse(res, 500, "Internal server error", error.message);
    }
}

//! Delete review
export const deleteReview = async (req, res) => {
    try {
        const {reviewId} = req.params;
        const review = await Review.findById(reviewId);

        if(!review){
            return errorResponse(res, 404, "Review not found");
        }
        /* Check if review belongs to user */
        if(review.author.toString() !== req.user._id.toString()){
            return errorResponse(res, 403, "You are not authorized to delete this review");
        }
         
        const targetId = review.target;
        const targetModel = review.targetModel;

        /* Delete review */
        await Review.findByIdAndDelete(reviewId);

        /* Recalculate rating */
        await updateReviewStats(targetId, targetModel);

        return successResponse(res, 200, "Review deleted successfully");
    } catch (error) {
        return errorResponse(res, 500, "Internal server error", error.message);
        
    }
}