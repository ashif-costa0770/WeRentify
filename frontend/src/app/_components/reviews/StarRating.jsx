"use client";

import { useState } from "react";
import { Star } from "lucide-react";

export default function StarRating({
  value = 0,
  onChange = () => {},
  size = 22,
  className = "",
}) {
  const [hovered, setHovered] = useState(0);

  const displayValue = hovered || value || 0;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {Array.from({ length: 5 }).map((_, index) => {
        const starValue = index + 1;
        const isActive = displayValue >= starValue;

        return (
          <button
            type="button"
            key={starValue}
            onMouseEnter={() => setHovered(starValue)}
            onMouseLeave={() => setHovered(0)}
            onClick={() => onChange(starValue)}
            className="cursor-pointer rounded-full p-0.5 transition-colors hover:bg-yellow-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
            aria-label={`Rate ${starValue} star${starValue > 1 ? "s" : ""}`}
          >
            <Star
              size={size}
              className={
                isActive
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }
            />
          </button>
        );
      })}
    </div>
  );
}

