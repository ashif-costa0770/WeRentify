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
      <section className="max-w-7xl mx-auto px-4">
        <div className="relative rounded-2xl max-h-44 overflow-hidden shadow-xl">
          <div className="absolute inset-0 bg-linear-to-r from-indigo-600 via-purple-600 to-pink-600" />

          <div className="relative px-8 py-3">
            <h1 className="text-lg md:text-xl font-extrabold text-white mb-1">
              Borrow what you need. Lend what you don&apos;t.
            </h1>
            <p className="text-white/90 text-sm mb-4">
              Join your local community and start sharing today
            </p>

            {/* Search Bar */}
            <div className="max-w-3xl mx-auto bg-white rounded-full shadow-lg flex items-center px-2 ">
              {/* Item */}
              <div className="flex-1 px-5 py-3 border-r border-gray-200">
                <p className="text-xs font-bold text-gray-700">Item</p>
                <input
                  value={item}
                  onChange={(e) => setItem(e.target.value)}
                  placeholder="Search for rent"
                  className="w-full text-sm text-gray-700 placeholder-gray-400 outline-none"
                />
              </div>

              {/* Location */}
              <div className="flex-1 px-5 py-3 border-r border-gray-200">
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
                className="flex-1 px-5 py-3 cursor-pointer"
              >
                <p className="text-xs font-bold text-gray-700">When</p>
                <p className="text-sm text-gray-400">Add dates</p>
              </div>

              {/* Search */}
              <button className="ml-2 bg-linear-to-r from-[#5B4FE9] to-[#E95FC8] text-white rounded-full w-12 h-12 flex items-center justify-center shadow-md">
                🔍
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
