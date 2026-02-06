"use client";

import { Truck } from "lucide-react";

export default function Step4Availability({ formData, setFormData }) {

  const handleInputChange = (e) => {
    const { name, checked, type } = e.target;
    setFormData({ ...formData, [name]: type === 'checkbox' ? checked : e.target.value });
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 p-4 rounded-xl">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="isAvailable"
            checked={formData.isAvailable}
            onChange={handleInputChange}
            className="mt-1 w-5 h-5 text-[#5B4FE9] border-gray-300 rounded focus:ring-[#5B4FE9] cursor-pointer"
          />
          <div>
            <span className="font-semibold text-gray-900 block">Item is currently available for rent</span>
            <span className="text-sm text-gray-500">Toggle this off if your item is not ready for immediate rental</span>
          </div>
        </label>
      </div>

      <div className="bg-gray-50 p-4 rounded-xl">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            name="offerDelivery"
            checked={formData.offerDelivery}
            onChange={handleInputChange}
            className="mt-1 w-5 h-5 text-[#5B4FE9] border-gray-300 rounded focus:ring-[#5B4FE9] cursor-pointer"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-gray-600" />
              <span className="font-semibold text-gray-900 block">Offer delivery</span>
            </div>
            <span className="text-sm text-gray-500">I can drop off this item to the renter for an additional fee</span>
          </div>
        </label>
      </div>

      {formData.offerDelivery && (
        <div className="pl-8 animate-in slide-in-from-top-2">
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Delivery Fee
          </label>
          <div className="relative max-w-xs">
            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">$</span>
            <input
              type="number"
              placeholder="0"
              min="0"
              className="w-full pl-10 text-gray-700 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]/20 focus:border-[#5B4FE9] transition-all"
            />
          </div>
        </div>
      )}
    </div>
  );
}