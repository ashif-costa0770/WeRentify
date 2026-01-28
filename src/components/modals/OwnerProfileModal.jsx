"use client";

import { X, Star } from "lucide-react";

export default function OwnerProfileModal({
  show,
  onClose,
  owner,
  items = [],
  onSelectItem,
}) {
  if (!show || !owner) return null;

  const ownerListings = items.filter(
    (item) => item.ownerId === owner.ownerId
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="relative bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden">
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute cursor-pointer top-4 right-4 bg-white rounded-full p-2 shadow text-gray-400 hover:text-gray-600"
        >
          <X size={22} />
        </button>

        {/* Header */}
        <div className="p-8 border-b">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20  rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-3xl font-bold">
              {owner.name.charAt(0)}
            </div>

            <div>
              <h2 className="text-2xl text-gray-800 font-black">{owner.name}</h2>
              <p className="text-sm text-gray-500 mb-3">Member since 2023</p>

              <div className="flex gap-6 text-sm">
                <div>
                  <p className="font-bold text-indigo-600">
                    {owner.rating}
                  </p>
                  <p className="text-gray-500">Rating</p>
                </div>

                <div>
                  <p className="font-bold text-indigo-600">
                    {owner.totalRentals}
                  </p>
                  <p className="text-gray-500">Total Rentals</p>
                </div>

                <div>
                  <p className="font-bold text-indigo-600">
                    {owner.responseTime}
                  </p>
                  <p className="text-gray-500">Response Time</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Listings */}
        <div className="p-8">
          <h3 className="text-xl text-gray-800 font-bold mb-6">
            {owner.name}’s Listings ({ownerListings.length})
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {ownerListings.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectItem(item)}
                className="border rounded-2xl overflow-hidden cursor-pointer hover:shadow-lg transition"
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="aspect-square object-cover"
                />

                <div className="p-4">
                  <h4 className="font-bold text-gray-800 text-sm mb-1 line-clamp-1">
                    {item.name}
                  </h4>

                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-1">
                    <Star
                      size={14}
                      className="fill-yellow-400 text-yellow-400"
                    />
                    <span>{item.rating}</span>
                  </div>

                  <p className="font-bold text-indigo-600 text-sm">
                    ${item.dailyRate}/day
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
