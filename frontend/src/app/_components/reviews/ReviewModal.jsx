"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import StarRating from "./StarRating";

export default function ReviewModal({
  open,
  onClose,
  onSubmit,
  submitting = false,
  initialRating = 0,
  initialComment = "",
  title = "Write a Review",
  submitLabel = "Submit review",
}) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (open) {
      setRating(initialRating || 0);
      setComment(initialComment || "");
    }
  }, [open, initialRating, initialComment]);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) return;
    await onSubmit({ rating, comment: comment.trim() });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-2 md:p-6 backdrop-blur-sm transition-all duration-150">
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-gray-100 overflow-hidden animate-fadeIn">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-yellow-100/100 via-white to-indigo-50/60">
          <h2 className="text-lg md:text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-xl">⭐</span>
            <span className="bg-gradient-to-r from-yellow-500 to-amber-400 bg-clip-text text-transparent">
              {title}
            </span>
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200 transition"
            aria-label="Close review modal"
            disabled={submitting}
          >
            <X size={20} className="cursor-pointer text-gray-500" />
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-6 px-6 py-4 md:py-8 bg-white"
        >
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-base font-semibold text-gray-800 tracking-wide">
                Overall rating
              </label>
              {rating > 0 && (
                <span className="inline-flex items-center gap-1 font-semibold text-indigo-600 text-sm bg-indigo-50 rounded-full px-3 py-0.5">
                  {rating}
                  <span className="text-yellow-400">★</span>
                </span>
              )}
            </div>
            <StarRating
              value={rating}
              onChange={setRating}
              className="justify-start"
            />
            <p className="mt-1 text-xs text-gray-500">
              Click a star to set your rating (1–5).
            </p>
          </div>

          <div>
            <label
              htmlFor="review-comment"
              className="mb-1 block text-sm font-medium text-gray-800"
            >
              Your review
            </label>
            <textarea
              id="review-comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              placeholder="Share your experience with this listing..."
            />
            <p className="mt-1 text-xs text-gray-400">
              Optional, up to 1000 characters.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="cursor-pointer  rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!rating || submitting}
              className="cursor-pointer rounded-xl bg-gray-900 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-black disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              {submitting ? "Submitting..." : submitLabel}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

