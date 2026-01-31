"use client";
import React from "react";
import { useUser } from "@/context/UserContext";
import { Star, Heart } from "lucide-react";
import Image from "next/image";

export default function ServiceCard({ service, onClick }) {
  const { favorites, toggleFavorite } = useUser();

  const isFavorite = favorites.includes(service.id);

  const handleFavoriteClick = (e) => {
    e.stopPropagation(); // ✅ prevent event bubbling to parent div
    toggleFavorite(service.id);
  };

  const handleShareClick = (e) => {
    e.stopPropagation(); // ✅ prevent event bubbling to parent div
    if (navigator.share) {
      navigator.share({
        title: service.name,
        text: `Check out this ${service.name} for rent on WeRentify!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div
      onClick={onClick} // ✅ open modal
      className="bg-white rounded-2xl overflow-hidden hover:shadow-lg
                 transition-all duration-300 cursor-pointer border border-gray-200 group w-full max-w-sm"
    >
      <div className="aspect-[4/3] relative overflow-hidden">
        <Image
          src={service.imageUrl}
          alt={service.name}
          width={500}
          height={300}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        <div className="absolute right-3 top-3 flex gap-2">
          <button
            onClick={handleShareClick}
            className="flex items-center justify-center w-9 h-9 bg-white/95 backdrop-blur-sm rounded-full cursor-pointer text-gray-700 hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg"
          >
            <svg
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 12v1a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3v-1"></path>
              <polyline points="8 2 8 8"></polyline>
              <polyline points="5 5 8 2 11 5"></polyline>
            </svg>
          </button>
          <button
            onClick={handleFavoriteClick}
            className="flex items-center justify-center w-9 h-9 bg-white/95 backdrop-blur-sm rounded-full cursor-pointer hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg"
          >
            <Heart
              size={16}
              className={
                isFavorite ? "fill-rose-500 text-rose-500" : "text-gray-700"
              }
            />
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
          {service.name}
        </h3>

        <p className="mt-2 text-base font-semibold text-gray-900">
          ${service.hourlyRate}
          <span className="text-sm font-normal text-gray-500"> / hour</span>
        </p>

        <div className="mt-2 flex items-center gap-1.5">
          <Star size={16} className="fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-semibold text-gray-900">
            {service.rating}
          </span>
          <span className="text-sm text-gray-500">({service.reviews})</span>
          {service.verified && (
            <span className="ml-auto flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              ✔ Verified
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
