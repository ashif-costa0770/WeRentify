"use client";

import {
  X,
  Star,
  MapPin,
  CheckCircle,
  Calendar,
  MessageCircle,
} from "lucide-react";

export default function ServiceModal({ service, onClose }) {
  if (!service) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative z-10 w-full max-w-3xl mx-4 rounded-3xl bg-white p-6 shadow-xl">
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute cursor-pointer right-5 top-5 text-gray-400 hover:text-gray-700"
        >
          <X size={22} />
        </button>

        {/* HEADER */}
        <div className="flex-col items-start gap-4">
          <div className="flex-col h-22 w-22 items-center mb-8 py-2 justify-center  rounded-xl text-8xl">
            {service.image || "🛠️"}
          </div>

          <div className="px-2">
            <h2 className="text-2xl font-bold text-gray-900">
              {service.name}
            </h2>
            <p className="text-gray-600">
              by <span className="font-medium">{service.provider}</span>
            </p>

            {/* META */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-md text-gray-600">
              <div className="flex items-center gap-1">
                <Star size={16} className="fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-gray-900">
                  {service.rating}
                </span>
                <span>({service.reviews} reviews)</span>
              </div>

              <div className="flex items-center gap-1">
                <MapPin size={16} />
                <span>{service.distance} miles away</span>
              </div>

              {service.verified && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle size={16} />
                  <span className="font-medium">Verified Provider</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PRICE BOX */}
        <div className="mt-6 rounded-2xl bg-orange-50 p-5">
          <p className="text-3xl font-extrabold text-orange-600">
            ${service.hourlyRate}/hour
          </p>
          <p className="mt-1 text-sm text-gray-700">
            Professional service with guaranteed quality
          </p>
        </div>

        {/* ACTIONS */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button className="flex items-center cursor-pointer justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-pink-500 px-6 py-4 text-white font-semibold hover:opacity-90 transition">
            <Calendar size={18} />
            Book Now
          </button>

          <button className="flex items-center cursor-pointer justify-center gap-2 rounded-xl border-2 border-orange-500 px-6 py-4 text-orange-600 font-semibold hover:bg-orange-50 transition">
            <MessageCircle size={18} />
            Contact Provider
          </button>
        </div>
      </div>
    </div>
  );
}
