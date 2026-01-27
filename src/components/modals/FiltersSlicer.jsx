"use client";

import { X } from "lucide-react";

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
  isMobile = false,
}) {
  if (!showFilters) return null;

  return (
    <div
      className="fixed inset-0 z-[55] bg-black/50 backdrop-blur-sm animate-fadeIn"
      onClick={onClose}
    >
      <div
        className={`absolute text-gray-800 bg-white shadow-2xl p-6 overflow-y-auto animate-slideIn
          ${
            isMobile
              ? "inset-x-0 bottom-0 rounded-t-3xl max-h-[80vh]"
              : "right-0 top-0 bottom-0 w-96"
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black">Filters</h2>
          <button className="cursor-pointer" onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        {/* Sort By */}
        <div className="mb-6">
          <label className="block font-bold mb-3">Sort By</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full p-3 cursor-pointer border-2 border-gray-300 rounded-xl"
          > 
            <option value="nearest">Nearest First</option>
            <option value="priceLow">Price: Low to High</option>
            <option value="priceHigh">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
          </select>
        </div>

        {/* Daily Price Range */}
        <div className="mb-6">
          <label className="block font-bold mb-3">
            Daily Price Range
          </label>

          <div className="flex gap-4 mb-2">
            <input
              type="number"
              value={priceRange[0]}
              onChange={(e) =>
                setPriceRange([+e.target.value, priceRange[1]])
              }
              className="w-1/2 p-2 border-2 border-gray-300 rounded-lg"
              placeholder="Min"
            />
            <input
              type="number"
              value={priceRange[1]}
              onChange={(e) =>
                setPriceRange([priceRange[0], +e.target.value])
              }
              className="w-1/2 p-2  border-2 border-gray-300 rounded-lg"
              placeholder="Max"
            />
          </div>

          <p className="text-sm text-gray-600">
            ${priceRange[0]} – ${priceRange[1]}
          </p>
        </div>

        {/* Distance */}
        <div className="mb-6">
          <label className="block font-bold mb-3">
            Maximum Distance: {distanceFilter} mi
          </label>
          <input
            type="range" 
            min="1"
            max="20"
            value={distanceFilter}
            onChange={(e) =>
              setDistanceFilter(+e.target.value)
            }
            className="w-full cursor-pointer"
          />
        </div>

        {/* Verified Only */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) =>
                setVerifiedOnly(e.target.checked)
              }
              className="w-5 cursor-pointer h-5"
            />
            <span className="font-semibold">
              Verified owners only
            </span>
          </label>
        </div>

        {/* Apply Button */}
        <button
          onClick={onClose}
          className="w-full bg-gradient-to-r cursor-pointer from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-bold"
        >
          Apply Filters
        </button>
      </div>
    </div>
  );
}
