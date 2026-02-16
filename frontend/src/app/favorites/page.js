"use client";

import { useUser } from "@/context/UserContext";
import Link from "next/link";
import Image from "next/image";
import { Trash2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function FavoritesPage() {
  const { favorites, removeFavorite } = useUser();

  const handleRemoveFavorite = async (favoriteId) => {
    try {
      await removeFavorite(favoriteId);
      toast.success("Removed from favorites");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to remove favorite");
    }
  };

  // Keep only favorites whose referenced product still exists.
  const validFavorites = (favorites || []).filter((fav) => {
    return fav && fav.productId && typeof fav.productId === "object";
  });

  // Separate services and listings using productType.
  const favoriteServices = validFavorites.filter(
    (fav) => fav.productType === "Service"
  );

  const favoriteListings = validFavorites.filter(
    (fav) => fav.productType === "Listing"
  );

  if (!validFavorites.length) {
    return (
      <div className="bg-gray-50 flex items-center justify-center py-18 px-4">
        <div className="bg-white rounded-3xl shadow-xl p-12 text-center max-w-md w-full">
          <h2 className="text-gray-700 text-xl font-medium mb-8">
            No favorites yet
          </h2>
          <Link
            href="/"
            className="inline-block bg-indigo-600 text-white px-8 py-3 rounded-xl"
          >
            Browse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          My Favorites
        </h1>

        {/* SERVICES */}
        {favoriteServices.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">
              Favorite Services
            </h2>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {favoriteServices.map((fav) => {
                const service = fav.productId;
                const serviceImage = service?.photos?.[0]?.url || service?.imageUrl;
                const serviceName =
                  service?.businessName || service?.serviceType || service?.name;

                return (
                  <div
                    key={fav._id}
                    className="bg-white rounded-2xl shadow-sm relative group overflow-hidden"
                  >
                    <div className="relative aspect-square bg-gray-200">
                      {serviceImage ? (
                        <Image
                          src={serviceImage}
                          alt={serviceName || "Service"}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          No image
                        </div>
                      )}

                      <button
                        onClick={() => handleRemoveFavorite(fav._id)}
                        className="absolute top-2 right-2 p-2 rounded-full bg-white text-gray-400 hover:text-rose-500 shadow"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-2">
                      <h3 className="font-bold text-xs line-clamp-1">
                        {serviceName || "Unnamed Service"}
                      </h3>

                      <p className="text-indigo-600 font-bold text-sm mt-1">
                        ${service?.hourlyRate || 0}/hr
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* LISTINGS */}
        {favoriteListings.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">
              Favorite Listings
            </h2>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {favoriteListings.map((fav) => {
                const listing = fav.productId;
                const imageUrl =
                  listing.photos?.[0]?.url || listing.imageUrl;

                return (
                  <div
                    key={fav._id}
                    className="bg-white rounded-2xl shadow-sm relative group overflow-hidden"
                  >
                    <div className="relative aspect-square bg-gray-200">
                      {imageUrl ? (
                        <Image
                          src={imageUrl}
                          alt={listing.itemName || listing.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                          No image
                        </div>
                      )}

                      <button
                        onClick={() => handleRemoveFavorite(fav._id)}
                        className="absolute top-2 right-2 p-2 rounded-full bg-white text-gray-400 hover:text-rose-500 shadow"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="p-2">
                      <h3 className="font-bold text-xs line-clamp-1">
                        {listing.itemName || listing.name || "Unnamed Listing"}
                      </h3>

                      <p className="text-indigo-600 font-bold text-sm mt-1">
                        ${listing.dailyRate || listing.hourlyRate || 0}/day
                      </p>
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
            className="inline-flex items-center gap-2 text-indigo-600 font-semibold"
          >
            Continue browsing
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
