"use client";

import { SlidersHorizontal } from "lucide-react";
import ItemCard from "./ItemCard";

export default function FeaturedListingsSection({
  visibleFeaturedItems = [],
  onOpenFilters = () => {},
  onSelectItem = () => {},
}) {
  return (
    <section className="max-w-7xl mx-auto px-4 mt-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-1.5">
            <span>⭐</span> Featured Items ({visibleFeaturedItems.length})
          </h2>
        </div>
        <button
          type="button"
          onClick={onOpenFilters}
          className="flex cursor-pointer items-center gap-2 rounded-full border-2 border-gray-300 bg-white px-3 py-2 text-xs font-bold text-gray-800 shadow-md hover:bg-gray-50"
        >
          <SlidersHorizontal size={14} />
          Filters
        </button>
      </div>
      <div className="grid gap-4 mb-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {visibleFeaturedItems.length > 0 ? (
          visibleFeaturedItems.map((item) => (
            <ItemCard
              key={item._id || item.id}
              item={item}
              onSelect={onSelectItem}
            />
          ))
        ) : (
          <p className="col-span-full py-8 text-center text-sm text-gray-500">
            No featured items match your current filters.
          </p>
        )}
      </div>
    </section>
  );
}
