"use client";

import { Star } from "lucide-react";

export default function ReviewSummary({ rating = 0, count = 0 }) {
  const formattedRating =
    typeof rating === "number" ? rating.toFixed(1) : Number(rating || 0).toFixed(1);

  return (
    <div className="inline-flex items-center gap-2 rounded-full py-2 text-sm text-gray-900">
      <div className="flex items-center gap-1">
        <Star size={24  } className="me-1 fill-yellow-400 text-yellow-400" />
        <span className="font-semibold text-xl">{formattedRating}</span>
      </div>
      <span className="text-gray-900 text-2xl">•</span>
      <span className="font-medium text-xl">
        {count} review{count === 1 ? "" : "s"}
      </span>
    </div>
  );
}

