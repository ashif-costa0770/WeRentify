"use client";

import { useUser } from "@/context/UserContext";
import Link from "next/link";
import Image from "next/image";
import { Heart, Trash2, ArrowRight } from "lucide-react";

export default function FavoritesPage() {
  const { favorites, setFavorites, toggleFavorite } = useUser();

  // Separate services and items
  const favoriteServices = favorites.filter((fav) => fav.type === "service");
  const favoriteItems = favorites.filter((fav) => fav.type === "item");

  const removeFavorite = (item) => {
    toggleFavorite(item, item.type); // This will remove it since it exists
  };

  if (favorites.length === 0) {
    return (
      <div className=" bg-gray-50 flex items-center justify-center py-18 px-4">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md w-full">
          <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-rose-400" strokeWidth={1.5} />
          </div>
          <h2 className="text-gray-700 text-xl font-medium mb-8">
            No favorites yet
          </h2>
          <div className="flex gap-3 flex-col">
            <Link
              href="/"
              className="inline-block bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-10 py-3.5 rounded-2xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-purple-200"
            >
              Browse Items
            </Link>
            <Link
              href="/services"
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-10 py-3.5 rounded-2xl font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-purple-200"
            >
              Browse Services
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
          <button
            onClick={() => setFavorites([])}
            className="text-rose-500 hover:text-rose-700 cursor-pointer font-medium text-sm"
          >
            Clear all
          </button>
        </div>

        {/* SERVICES SECTION */}
        {favoriteServices.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Favorite Services
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {favoriteServices.map((service) => (
                <div
                  key={`service-${service.id}`}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:scale-102 transform transition-all duration-200 group relative overflow-hidden"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={service.imageUrl}
                      alt={service.name}
                      fill
                      className="object-cover group-hover:scale-102 transition-transform duration-300"
                    />
                    <button
                      onClick={() => removeFavorite(service)}
                      className="absolute top-2 right-2 p-2 cursor-pointer rounded-full bg-white/95 text-gray-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-2">
                    <h3 className="font-bold text-gray-900 text-xs line-clamp-1">
                      {service.name}
                    </h3>

                    <p className="text-indigo-600 font-bold text-sm mt-1">
                      ${service.hourlyRate}/hr
                    </p>

                    <button
                      onClick={() => removeFavorite(service)}
                      className="w-full mt-2 cursor-pointer p-1 border border-gray-200 rounded-lg text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-colors text-xs font-medium"
                    >
                      <Heart className="w-3 h-3 inline mr-1 fill-current" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ITEMS SECTION */}
        {favoriteItems.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Favorite Items
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {favoriteItems.map((item) => {
                const itemId = item._id || item.id;
                const imageUrl = item.photos?.[0]?.url || item.imageUrl;
                return (
                  <div
                    key={`item-${itemId}`}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-xl hover:scale-103 transform transition-all duration-200 group relative overflow-hidden"
                  >
                    <div className="relative aspect-square bg-gray-200">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={item.itemName || item.name || "Item"}
                          fill
                          className="object-cover group-hover:scale-103 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No image
                        </div>
                      )}
                      <button
                        onClick={() => removeFavorite(item)}
                        className="absolute top-2 right-2 p-2 cursor-pointer rounded-full bg-white/95 text-gray-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all shadow-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-2">
                      <h3 className="font-bold text-gray-900 text-xs line-clamp-1">
                        {item.itemName || item.name}
                      </h3>

                      <p className="text-indigo-600 font-bold text-sm mt-1">
                        ${item.dailyRate || item.hourlyRate || "0"}/day
                      </p>

                      <button
                        onClick={() => removeFavorite(item)}
                        className="w-full mt-2 cursor-pointer p-1 border border-gray-200 rounded-lg text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-colors text-xs font-medium"
                      >
                        <Heart className="w-3 h-3 inline mr-1 fill-current" />
                        Remove
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:text-indigo-700 transition-colors"
          >
            Continue browsing
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
