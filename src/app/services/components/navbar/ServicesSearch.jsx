"use client";
import React from "react";
import { useState } from "react";
import { Search } from "lucide-react";
import DatePickerModal from "@/components/modals/DatePicker";

export default function ServicesSearch() {
  const [showDatePicker, setShowDatePicker] = useState(false);
  return (
    <div className="relative mx-auto rounded-2xl max-w-310 bg-gradient-to-r from-[#6366f1] via-[#d946ef] to-[#ec4899] py-2 px-6">
      <div className="max-w-7xl mx-auto px-2 text-center">
        <h1 className="text-2xl md:text-2xl font-bold text-white">
          Find Local Services
        </h1>
        <p className="text-white/90 text-sm mb-2">
          Connect with trusted service providers in your community
        </p>

        {/* Search Bar */}
        <div className="max-w-3xl mx-auto bg-white rounded-full p-1 pl-8 flex flex-col md:flex-row items-center shadow-2xl space-y-4 md:space-y-0 divider-x">
          {/* Service Needed */}
          <div className="flex-1 w-full text-left md:border-r border-gray-200 pr-4">
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide ml-1 mb-1">
              Service needed
            </label>
            <div className="flex items-center">
              <input
                type="text"
                placeholder="Search Services"
                className="w-full text-gray-600 placeholder-gray-400 focus:outline-none text-base"
              />
            </div>
          </div>

          {/* Location */}
          <div className="flex-1 w-full text-left md:border-r border-gray-200 px-4">
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide ml-1 mb-1">
              Location
            </label>
            <input
              type="text"
              placeholder="City, State or Zip"
              className="w-full text-gray-600 placeholder-gray-400 focus:outline-none text-base"
            />
          </div>

          {/* Date */}
          <div
            onClick={() => setShowDatePicker(true)}
            className="flex-1 w-full cursor-pointer text-left px-4"
          >
            <label className="block text-xs font-bold text-gray-800 uppercase tracking-wide ml-1 mb-1">
              Date
            </label>
            <input
              type="text"
              placeholder="Select date"
              className="w-full text-gray-600 placeholder-gray-400 focus:outline-none text-base"
            />
          </div>

          {/* Search Button */}
          <button className="bg-[#a855f7] hover:bg-[#9333ea] text-white p-4 rounded-full transition-transform hover:scale-105 flex-shrink-0">
            <Search size={24} />
          </button>
        </div>
      </div>
      <DatePickerModal
        open={showDatePicker}
        onClose={() => setShowDatePicker(false)}
      />
    </div>
  );
}
