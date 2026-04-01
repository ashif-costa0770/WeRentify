"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Star,
  MapPin,
  CheckCircle,
  Calendar,
  XCircle,
  MessageCircle,
  Loader2,
  Edit3,
  Trash2,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { getServiceById } from "@/services/services.service";
import {
  getAllReviews,
  createReview as createReviewApi,
  updateReview as updateReviewApi,
  deleteReview as deleteReviewApi,
} from "@/services/review.service";
import { getMyBookings } from "@/services/booking.service";
import ReviewSummary from "@/app/_components/reviews/ReviewSummary";
import ReviewModal from "@/app/_components/reviews/ReviewModal";
import { timeAgo } from "@/utils/timeAgo";
import { mapBackendService } from "../_lib/mapBackendService";
import ServiceBookingModal from "./components/service-booking-modal";

export default function ServiceDetailsPage() {
  const params = useParams();
  const serviceId = params?.serviceId;
  const { isLogin, user, setShowSignIn, setShowMessages, setSelectedConversation } = useUser();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [hasCompletedBooking, setHasCompletedBooking] = useState(false);
  const [reviewBookingId, setReviewBookingId] = useState(null);
  const [hasUserReview, setHasUserReview] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [deleteReviewTarget, setDeleteReviewTarget] = useState(null);
  const [deletingReview, setDeletingReview] = useState(false);

  const ownerId =
    (typeof service?.owner === "object" ? service.owner?._id : service?.owner) || service?.ownerId || null;
  const isOwnService = Boolean(user?._id && ownerId) && String(user._id) === String(ownerId);

  const canAddReview =
    isLogin && !isOwnService && hasCompletedBooking && !hasUserReview;

  useEffect(() => {
    if (!service) return;
    const targetId = service.id || service._id || serviceId;

    async function fetchReviewsForService(id) {
      setReviewsLoading(true);
      setReviewsError("");
      try {
        const res = await getAllReviews(id, "Service");
        const payload = res?.data?.data || {};
        const list = Array.isArray(payload.reviews) ? payload.reviews : [];
        const total = Number(payload.totalReviews ?? list.length) || 0;
        setReviews(list);
        setTotalReviews(total);

        if (user?._id) {
          const userId = String(user._id);
          const hasReview = list.some((review) => {
            const author = review.author;
            const authorId =
              typeof author === "string"
                ? author
                : author?._id || author?.id || null;
            return authorId && String(authorId) === userId;
          });
          setHasUserReview(hasReview);
        } else {
          setHasUserReview(false);
        }
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          "Failed to load reviews for this service";
        setReviewsError(msg);
        setReviews([]);
        setTotalReviews(0);
      } finally {
        setReviewsLoading(false);
      }
    }

    async function evaluateBookingEligibility(id) {
      if (!id || !isLogin) {
        setHasCompletedBooking(false);
        setReviewBookingId(null);
        return;
      }

      try {
        const res = await getMyBookings();
        const data = res?.data?.data;
        const bookingsArray = Array.isArray(data) ? data : [];

        const normalizeId = (value) => {
          if (!value) return null;
          if (typeof value === "string") return value;
          return value._id || value.id || null;
        };

        const targetIdStr = String(id);

        const eligibleBookings = bookingsArray.filter((booking) => {
          const status = String(booking?.status || "").toLowerCase();
          if (status !== "completed") return false;

          const model = String(booking?.resourceModel || "").toLowerCase();
          const type = String(booking?.bookingType || "").toLowerCase();
          const isServiceBooking =
            model === "service" || type === "service";

          if (!isServiceBooking) return false;

          const resourceId = normalizeId(booking.resource);
          if (!resourceId) return false;

          return String(resourceId) === targetIdStr;
        });

        if (eligibleBookings.length > 0) {
          setHasCompletedBooking(true);
          setReviewBookingId(eligibleBookings[0]._id);
        } else {
          setHasCompletedBooking(false);
          setReviewBookingId(null);
        }
      } catch {
        setHasCompletedBooking(false);
        setReviewBookingId(null);
      }
    }

    fetchReviewsForService(targetId);
    evaluateBookingEligibility(targetId);
  }, [service, serviceId, isLogin, user?._id]);

  const handleOpenNewReview = () => {
    setEditingReview(null);
    setShowReviewModal(true);
  };

  const handleOpenEditReview = (review) => {
    setEditingReview(review);
    setShowReviewModal(true);
  };

  const handleOpenBooking = () => {
    if (isOwnService) {
      toast.error("You cannot book your own service");
      return;
    }
    if (!isLogin) {
      setShowSignIn(true);
      return;
    }
    setShowBookingModal(true);
  };

  const handleContactProvider = () => {
    if (isOwnService) {
      toast.error("You cannot message yourself");
      return;
    }
    if (!isLogin) {
      setShowSignIn(true);
      return;
    }

    setSelectedConversation({
      itemId: serviceId,
      itemName: service?.name,
      otherUser: service?.provider,
      refModel: "Service",
    });
    setShowMessages(true);
  };

  const handleSubmitReview = async ({ rating, comment }) => {
    const targetId = serviceId;
    setSubmittingReview(true);
    try {
      if (editingReview && editingReview._id) {
        await updateReviewApi(editingReview._id, { rating, comment });
        toast.success("Review updated successfully");
      } else {
        if (!reviewBookingId) {
          toast.error("No eligible booking found for this service.");
          return;
        }
        await createReviewApi({
          bookingId: reviewBookingId,
          rating,
          comment,
        });
        toast.success("Review submitted successfully");
        setHasUserReview(true);
      }

      setShowReviewModal(false);
      setEditingReview(null);

      if (targetId) {
        try {
          const res = await getAllReviews(targetId, "Service");
          const payload = res?.data?.data || {};
          const list = Array.isArray(payload.reviews) ? payload.reviews : [];
          const total = Number(payload.totalReviews ?? list.length) || 0;
          setReviews(list);
          setTotalReviews(total);
        } catch {
          // ignore secondary refresh error
        }
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Failed to save review. Please try again.";
      toast.error(msg);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleConfirmDeleteReview = async () => {
    const targetId = serviceId;
    if (!deleteReviewTarget?._id) return;
    setDeletingReview(true);
    try {
      await deleteReviewApi(deleteReviewTarget._id);
      toast.success("Review deleted successfully");
      setDeleteReviewTarget(null);
      setHasUserReview(false);

      if (targetId) {
        try {
          const res = await getAllReviews(targetId, "Service");
          const payload = res?.data?.data || {};
          const list = Array.isArray(payload.reviews) ? payload.reviews : [];
          const total = Number(payload.totalReviews ?? list.length) || 0;
          setReviews(list);
          setTotalReviews(total);
        } catch {
          // ignore secondary refresh error
        }
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Failed to delete review. Please try again.";
      toast.error(msg);
    } finally {
      setDeletingReview(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    async function fetchService() {
      if (!serviceId) return;
      setLoading(true);
      setError("");

      try {
        const res = await getServiceById(serviceId);
        const rawService = res?.data?.data?.service || res?.data?.service || null;

        if (!rawService) {
          throw new Error("Service not found");
        }

        if (!cancelled) {
          setService(mapBackendService(rawService));
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError?.response?.data?.message || fetchError?.message || "Failed to load service");
          setService(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchService();

    return () => {
      cancelled = true;
    };
  }, [serviceId]);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[55vh] w-full max-w-4xl items-center justify-center px-4">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600" />
          <p className="mt-4 text-gray-600">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-10">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || "Service not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 mb-10">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[6fr_6fr] lg:items-start">
          {/* Left: Service details */}
          <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm">
            {/* Unified card: image (top) + details (bottom) */}
            <div>
              {service.imageUrl ? (
                <div className="relative h-[180px] w-full overflow-hidden sm:h-[200px] lg:h-[320px]">
                  <Image
                    src={service.imageUrl}
                    alt={service.name}
                    fill
                    sizes="(max-width: 1024px) 100vw, 65vw"
                    className="object-fill"
                    priority
                  />
                </div>
              ) : (
                <div className="flex h-[180px] items-center justify-center bg-gray-50 px-4 sm:h-[200px] lg:h-[230px]">
                  <span className="text-4xl font-semibold text-gray-400">Service</span>
                </div>
              )}
            </div>

            <div className="p-6">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 md:text-3xl">
                {service.name}
              </h1>
              <p className="mt-1 text-md text-gray-600">
                by <span className="font-medium text-gray-800">{service.provider}</span>
              </p>

              <div
                className="mt-4 text-md leading-6 text-gray-600"
                dangerouslySetInnerHTML={{ __html: service.description }}
              />

              {service.hourlyRate !== undefined &&
              service.hourlyRate !== null &&
              Number(service.hourlyRate) > 0 ? (
                <div className="mt-4 flex items-center gap-2">
                  <p className="text-3xl font-extrabold text-orange-600">
                    ${service.hourlyRate}/hour
                  </p>
                </div>
              ) : null}


              <div className="mt-4 rounded-lg py-3">
                <div className="flex flex-wrap items-center justify-between gap-3 text-md text-gray-600">
                  <div className="flex items-center gap-1">
                    <Star
                      size={16}
                      className="fill-yellow-400 text-yellow-400"
                    />
                    <span className="font-semibold text-gray-900">
                      {service.rating ?? 0}
                    </span>
                    <span className="text-gray-600">
                      ({service.reviewCount ?? totalReviews} reviews)
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-gray-500" />
                    <span>{service.distance} miles away</span>
                  </div>

                  {service.verified ? (
                    <div className="flex items-center gap-2 text-green-700">
                      <CheckCircle size={16} />
                      <span className="font-medium">Verified</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-rose-700">
                      <XCircle size={16} />
                      <span className="font-medium">Not Verified</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  onClick={handleOpenBooking}
                  disabled={isOwnService}
                  title={
                    isOwnService ? "You cannot book your own service" : undefined
                  }
                  className={`flex items-center justify-center gap-2 rounded-xl px-6 py-4 font-semibold text-white transition ${
                    isOwnService
                      ? "cursor-not-allowed bg-slate-300"
                      : "cursor-pointer bg-linear-to-r from-indigo-500 to-pink-500 hover:opacity-90"
                  }`}
                >
                  <Calendar size={18} />
                  Book Now
                </button>

                <button
                  onClick={handleContactProvider}
                  disabled={isOwnService}
                  title={
                    isOwnService ? "You cannot contact your own service" : undefined
                  }
                  className={`flex items-center justify-center gap-2 rounded-xl border-2 px-6 py-4 font-semibold transition ${
                    isOwnService
                      ? "cursor-not-allowed border-slate-300 text-slate-400"
                      : "cursor-pointer border-orange-500 text-orange-600 hover:bg-orange-50"
                  }`}
                >
                  <MessageCircle size={18} />
                  Contact Provider
                </button>
              </div>
            </div>
          </div>

          {/* Right: Reviews */}
          <div className="overflow-hidden rounded-lg border border-gray-100 bg-white shadow-sm lg:sticky lg:top-[88px]">
            <div className="border-b border-gray-100 bg-gray-50/40 px-6 py-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-gray-900">
                  Reviews & Ratings
                </h2>

                {canAddReview && (
                  <button
                    type="button"
                    onClick={handleOpenNewReview}
                    className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-yellow-400 to-yellow-200 px-5 py-2 text-sm font-bold text-gray-900 shadow-lg hover:from-yellow-500 hover:to-yellow-300 transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
                  >
                    <Star
                      size={16}
                      className="fill-yellow-400 text-yellow-600"
                    />
                    Add Review
                  </button>
                )}
              </div>

              <div className="mt-4">
                <ReviewSummary
                  rating={service.rating ?? 0}
                  count={service.reviewCount ?? totalReviews}
                />
              </div>
            </div>

            <div className="px-6 py-5">
              {reviewsLoading ? (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Loader2 className="size-4 animate-spin text-indigo-600" />
                  <span>Loading reviews...</span>
                </div>
              ) : reviewsError ? (
                <p className="text-sm text-red-600">{reviewsError}</p>
              ) : reviews.length === 0 ? (
                <p className="text-sm text-gray-600">
                  No reviews yet.{" "}
                  {canAddReview
                    ? "Be the first to share your experience."
                    : "Bookings must be completed before leaving a review."}
                </p>
              ) : (
                <div className="max-h-[55vh] space-y-4 overflow-y-auto pr-2 sm:max-h-[65vh]">
                  {reviews.map((review) => {
                    const author = review.author || {};
                    const fullName =
                      `${author.firstname || ""} ${author.lastname || ""}`.trim() ||
                      author.email ||
                      "Guest";
                    const initial = fullName.charAt(0).toUpperCase();
                    const isOwnReview =
                      user?._id &&
                      review.author &&
                      String(
                        typeof review.author === "string"
                          ? review.author
                          : review.author._id || review.author.id,
                      ) === String(user._id);

                    return (
                      <article
                        key={review._id}
                        className="rounded-lg border border-gray-100 bg-white px-5 py-3 shadow-sm"
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="flex flex-wrap items-center justify gap-3">
                                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                                  {initial || "U"}
                                </div>
                                <div>
                                  <p className="text-sm font-semibold text-gray-800">
                                    {fullName}
                                  </p>
                                  {review.createdAt && (
                                    <p className="text-[12px] font-medium text-gray-600">
                                      {timeAgo(review.createdAt)}
                                    </p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, index) => {
                                  const value = index + 1;
                                  const isActive =
                                    Number(review.rating || 0) >= value;
                                  return (
                                    <Star
                                      key={value}
                                      size={16}
                                      className={
                                        isActive
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-200"
                                      }
                                    />
                                  );
                                })}
                                <span className="ml-1 text-sm font-medium text-gray-700">
                                  {Number(review.rating || 0).toFixed(1)}
                                </span>
                              </div>
                            </div>

                            {review.comment && (
                              <p className="mt-2 rounded-xl px-2 py-1.5 text-[14px] font-medium leading-6 text-gray-700">
                                {review.comment}
                              </p>
                            )}

                            {isOwnReview && (
                              <div className="mt-3 flex justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditReview(review)}
                                  className="cursor-pointer inline-flex items-center gap-1 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 hover:border-indigo-200"
                                  title="Edit review"
                                >
                                  <Edit3 size={13} />
                                  <span>Edit</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setDeleteReviewTarget(review)}
                                  className="cursor-pointer inline-flex items-center gap-1 rounded-full border border-rose-100 bg-rose-50 px-3 py-1 text-[11px] font-semibold text-rose-700 hover:bg-rose-100 hover:border-rose-200"
                                  title="Delete review"
                                >
                                  <Trash2 size={13} />
                                  <span>Delete</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ServiceBookingModal
        service={service}
        open={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />
      <ReviewModal
        open={showReviewModal}
        onClose={() => {
          setShowReviewModal(false);
          setEditingReview(null);
        }}
        onSubmit={handleSubmitReview}
        submitting={submittingReview}
        initialRating={
          editingReview && typeof editingReview.rating === "number"
            ? editingReview.rating
            : 0
        }
        initialComment={editingReview?.comment || ""}
        title={editingReview ? "Edit your review" : "Write a Review"}
        submitLabel={editingReview ? "Save changes" : "Submit review"}
      />
      {deleteReviewTarget && (
        <div className="fixed inset-0 z-[65] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl border border-gray-100">
            <h3 className="text-base font-semibold text-gray-900 mb-2">
              Delete review?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              This action cannot be undone. Are you sure you want to delete your
              review?
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteReviewTarget(null)}
                disabled={deletingReview}
                className="cursor-pointer rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeleteReview}
                disabled={deletingReview}
                className="cursor-pointer rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
              >
                {deletingReview ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
