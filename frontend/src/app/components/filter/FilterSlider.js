"use client";

import { useState } from "react";

export default function FilterSlider({ open, onClose }) {
  const [distance, setDistance] = useState(17);

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
      />

      {/* Drawer */}
      <aside className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-xl font-bold">Filters</h2>
          <button
            onClick={onClose}
            className="text-2xl font-light hover:opacity-60"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Sort By */}
          <div>
            <label className="block font-semibold mb-2">Sort By</label>
            <select className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500">
              <option>Recommended</option>
              <option>Price: Low to High</option>
              <option>Price: High to Low</option>
              <option>Newest</option>
            </select>
          </div>

          {/* Price Range */}
          <div>
            <label className="block font-semibold mb-2">
              Daily Price Range
            </label>

            <div className="flex gap-3">
              <input
                type="number"
                placeholder="0"
                className="w-1/2 border rounded-lg px-4 py-3"
              />
              <input
                type="number"
                placeholder="200"
                className="w-1/2 border rounded-lg px-4 py-3"
              />
            </div>

            <p className="text-sm text-gray-500 mt-1">$0 – $200</p>
          </div>

          {/* Distance Slider */}
          <div>
            <label className="block font-semibold mb-2">
              Maximum Distance: {distance} mi
            </label>

            <input
              type="range"
              min="1"
              max="50"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              className="w-full accent-blue-600"
            />
          </div>

          {/* Checkbox */}
          <label className="flex items-center gap-3 text-sm font-medium">
            <input type="checkbox" className="w-4 h-4" />
            Verified owners only
          </label>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl font-bold text-white bg-linear-to-r from-[#5B4FE9] to-[#E95FC8]"
          >
            Apply Filters
          </button>
        </div>
      </aside>
    </>
  );
}
