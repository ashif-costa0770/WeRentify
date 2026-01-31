"use client";

import { useEffect, useState } from "react";
import DatePickerModal from "../modals/DatePicker";

const ITEM_SUGGESTIONS = ["Drill", "Camera", "Ladder", "Party speaker"];
const LOCATION_SUGGESTIONS = [
  "New York",
  "San Francisco",
  "Chicago",
  "Los Angeles",
];

export default function HeroSearch() {
  const [item, setItem] = useState("");
  const [location, setLocation] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <>
      <section className="max-w-7xl mx-auto px-2 ">
        <div className="relative rounded-2xl overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-linear-to-r from-[#6366f1] via-[#d946ef] to-[#ec4899]" />

          <div className="relative px-4 sm:px-6 md:px-8 py-2 md:py-2">
            {/* Hero Text */}
            <div className="text-center md:text-left mb-6 md:mb-4">
              <h1 className="text-xl sm:text-lg md:text-lg lg:text-xl font-extrabold text-white">
                Borrow what you need. Lend what you don&apos;t.
              </h1>
              <p className="text-white/90 text-sm sm:text-base md:text-sm">
                Join your local community and start sharing today
              </p>
            </div>

            {/* Search Bar - Desktop/Tablet (md and up) */}
            <div className="hidden md:flex max-w-3xl mx-auto bg-white rounded-full shadow-lg items-center px-2">
              {/* Item */}
              <div className="flex-1 px-4 lg:px-5 py-3 border-r border-gray-200">
                <p className="text-xs font-bold text-gray-700">Item</p>
                <input
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                  placeholder="Search for rent"
                  className="w-full text-sm text-gray-700 placeholder-gray-400 outline-none"
                />
              </div>

              {/* Location */}
              <div className="flex-1 px-4 lg:px-5 py-3 border-r border-gray-200">
                <p className="text-xs font-bold text-gray-700">Location</p>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State or Zip"
                  className="w-full text-sm text-gray-700 placeholder-gray-400 outline-none"
                />
              </div>

              {/* When */}
              <div
                onClick={() => setShowDatePicker(true)}
                className="flex-1 px-4 lg:px-5 py-3 cursor-pointer hover:bg-gray-50 rounded-r-full transition-colors"
              >
                <p className="text-xs font-bold text-gray-700">When</p>
                <p className="text-sm text-gray-400">Add dates</p>
              </div>

              {/* Search Button */}
              <button className="ml-2 bg-linear-to-r from-[#5B4FE9] to-[#E95FC8] text-white rounded-full w-12 h-12 flex items-center justify-center shadow-md hover:shadow-lg transition-shadow">
                🔍
              </button>
            </div>

            {/* Search Bar - Mobile (below md) */}
            <div className="md:hidden space-y-2">
              {/* Item Input */}
              <div className="bg-white rounded-2xl shadow-lg px-3 py-2">
                <p className="text-xs font-bold text-gray-700">Item</p>
                <input
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                  placeholder="Search for rent"
                  className="w-full text-sm text-gray-700 placeholder-gray-400 outline-none"
                />
              </div>

              {/* Location Input */}
              <div className="bg-white rounded-2xl shadow-lg px-3 py-2">
                <p className="text-xs font-bold text-gray-700 ">Location</p>
                <input
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, State or Zip"
                  className="w-full text-sm text-gray-700 placeholder-gray-400 outline-none"
                />
              </div>

              {/* When Input */}
              <div
                onClick={() => setShowDatePicker(true)}
                className="bg-white rounded-2xl shadow-lg px-3 py-2 cursor-pointer active:scale-95 transition-transform"
              >
                <p className="text-xs font-bold text-gray-700">When</p>
                <p className="text-sm text-gray-400">Add dates</p>
              </div>

              {/* Search Button - Full Width on Mobile */}
              <button className="w-full bg-linear-to-r from-[#5B4FE9] to-[#E95FC8] text-white cursor-pointer rounded-2xl py-2 px-4 flex items-center justify-center gap-2 shadow-lg font-semibold text-base active:scale-95 transition-transform">
                <span className="text-xl">🔍</span>
                <span>Search</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <DatePickerModal
        open={showDatePicker}
        onClose={() => setShowDatePicker(false)}
      />
    </>
  );
}