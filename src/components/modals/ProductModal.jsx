"use client";

import { X, Star, CheckCircle, MapPin, MessageSquare, Calendar } from "lucide-react";

export default function ProductModal({
  item,
  isOpen,
  onClose,
  isMobile = false,
}) {
  if (!isOpen || !item) return null;

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white shadow-2xl overflow-hidden
          ${
            isMobile
              ? "absolute inset-x-0 bottom-0 rounded-t-3xl"
              : "relative max-w-3xl mx-auto mt-24 rounded-2xl"
          }`}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute cursor-pointer top-4 right-4 text-gray-500 hover:text-gray-800"
        >
          <X size={22} />
        </button>

        {/* Content */}
        <div className="p-6">
          {/* Header */}
          <div className="flex-col gap-4 mb-4">
            <div className="w-25 h-22 rounded-xl bg-indigo-50 flex items-center justify-center text-2xl overflow-hidden">
              {item.imageUrl ? (
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{item.image}</span>
              )}
            </div>

            <div className="flex-1">
              <h2 className="text-3xl mt-4 font-extrabold text-gray-900">
                {item.name}
              </h2>
              <p className="text-lg ps-1 py-1 text-gray-600">
                 by {item.owner}
              </p>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 text-sm mb-5">
            <div className="flex items-center gap-1">
              <Star size={14} className="fill-yellow-400 text-yellow-400" />
              <span className="font-bold text-gray-700">{item.rating}</span>
              <span className="text-gray-500">
                ({item.reviews} reviews)
              </span>
            </div>

            <div className="flex items-center gap-1 text-gray-600">
              <MapPin size={14} />
              {item.distance} miles away
            </div>

            {item.verified && (
              <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                <CheckCircle size={14} />
                Verified Provider
              </div>
            )}
          </div>

          {/* Price box */}
          <div className="bg-orange-50 rounded-xl p-5 mb-6">
            <div className="text-3xl font-extrabold text-orange-600">
              ${item.hourlyRate}/hour
            </div>
            <p className="text-sm text-gray-700 mt-1">
              Professional service with guaranteed quality
            </p>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => console.log("Book Now")}
              className="flex cursor-pointer items-center justify-center gap-2 py-3 rounded-xl font-bold text-white
                bg-gradient-to-r from-indigo-600 to-purple-600"
            >
              <Calendar size={18} />
              Book Now
            </button>

            <button
              onClick={() => console.log("Contact Provider")}
              className="flex cursor-pointer items-center justify-center gap-2 py-3 rounded-xl font-bold
                border-2 border-orange-500 text-orange-500 hover:bg-orange-50"
            >
              <MessageSquare size={18} />
              Contact Provider
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
