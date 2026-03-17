"use client";

import { SlidersHorizontal } from "lucide-react";

export default function GlobalServicesHeader({ totalCount, onOpenFilters }) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={onOpenFilters}
        className="flex cursor-pointer items-center gap-2 rounded-full border-2 border-gray-300 bg-white px-3 py-2 text-xs font-bold text-gray-800 shadow-md hover:bg-gray-50"
      >
        <SlidersHorizontal size={14} />
        Filters
      </button>
    </div>
  );
}
