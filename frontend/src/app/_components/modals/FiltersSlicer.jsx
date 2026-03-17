"use client";

import { useState } from "react";

export default function FiltersSlicer({
  showFilters,
  onClose,
  sortBy,
  setSortBy,
  priceRange,
  setPriceRange,
  distanceFilter,
  setDistanceFilter,
  verifiedOnly,
  setVerifiedOnly,
  featuredOnly = false,
  setFeaturedOnly,
  onApply,
}) {
  const [localMin, setLocalMin] = useState(priceRange[0]);
  const [localMax, setLocalMax] = useState(priceRange[1]);

  if (!showFilters) return null;

  const handleApply = () => {
    setPriceRange([localMin, localMax]);
    onApply?.();
  };

  return (
    <>
      {/* Overlay (matches services filter) */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 cursor-pointer"
      />

      {/* Drawer (matches services filter) */}
      <aside className="fixed right-0 top-0 h-full w-full max-w-[400px] bg-white z-60 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold">Filters</h2>
          <button
            onClick={onClose}
            className="text-2xl font-light hover:opacity-60 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Sort By */}
          <div>
            <label className="block font-semibold mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
            >
              <option value="nearest">Nearest First</option>
              <option value="priceLow">Price: Low to High</option>
              <option value="priceHigh">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>

          {/* Daily Price Range */}
          <div>
            <label className="block font-semibold mb-2">Daily Price Range</label>

            <div className="flex gap-3">
              <input
                type="number"
                value={localMin}
                onChange={(e) => setLocalMin(Number(e.target.value) || 0)}
                className="w-1/2 border rounded-lg px-4 py-3"
                placeholder="0"
              />
              <input
                type="number"
                value={localMax}
                onChange={(e) => setLocalMax(Number(e.target.value) || 0)}
                className="w-1/2 border rounded-lg px-4 py-3"
                placeholder="100000"
              />
            </div>

            <p className="text-sm text-gray-500 mt-1">
              ${localMin} – ${localMax}
            </p>
          </div>

          {/* Distance Slider */}
          <div>
            <label className="block font-semibold mb-2">
              Maximum Distance: {distanceFilter} mi
            </label>

            <input
              type="range"
              min="1"
              max="1000"
              value={distanceFilter}
              onChange={(e) => setDistanceFilter(+e.target.value)}
              className="w-full accent-blue-600 cursor-pointer"
            />
          </div>

          {/* Featured only */}
          <label className="flex items-center gap-3 text-sm font-medium cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 cursor-pointer"
              checked={featuredOnly}
              onChange={(e) => setFeaturedOnly(e.target.checked)}
            />
            Featured items only
          </label>

          {/* Verified owners */}
          <label className="flex items-center gap-3 text-sm font-medium cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 cursor-pointer"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
            />
            Verified owners only
          </label>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t">
          <button
            onClick={handleApply}
            className="w-full py-3 rounded-xl font-bold text-white bg-linear-to-r from-[#5B4FE9] to-[#E95FC8] cursor-pointer"
          >
            Apply Filters
          </button>
        </div>
      </aside>
    </>
  );
}
