"use client";

import { MapPin } from "lucide-react";
import { categories } from "@/data/listingsData";
export default function Step2Details({ formData, setFormData }) {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Item Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="itemName"
          value={formData.itemName}
          onChange={handleInputChange}
          placeholder="e.g., Professional Pressure Washer"
          className="w-full px-4 py-3 text-gray-700 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]/20 focus:border-[#5B4FE9] transition-all placeholder:text-gray-400"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-4 py-3 text-gray-700 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]/20 focus:border-[#5B4FE9] transition-all appearance-none bg-white cursor-pointer"
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe your item, its condition, and any special features..."
          rows={4}
          className="w-full px-4 text-gray-700 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]/20 focus:border-[#5B4FE9] transition-all placeholder:text-gray-400 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Pickup Location <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="pickupLocation"
            value={formData.pickupLocation}
            onChange={handleInputChange}
            placeholder="Street address, City, State ZIP"
            className="w-full pl-12 pr-4 py-3 text-gray-700 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]/20 focus:border-[#5B4FE9] transition-all placeholder:text-gray-400"
          />
        </div>
      </div>
    </div>
  );
}
