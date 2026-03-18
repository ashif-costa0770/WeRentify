"use client";

import { useUser } from "@/context/UserContext";
import Link from "next/link";
import Image from "next/image";
import { Heart, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useMemo } from "react";

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

  const validFavorites = useMemo(
    () =>
      (favorites || []).filter(
        (fav) => fav && fav.productId && typeof fav.productId === "object",
      ),
    [favorites],
  );

  const favoriteServices = useMemo(
    () => validFavorites.filter((fav) => fav.productType === "Service"),
    [validFavorites],
  );

  const favoriteListings = useMemo(
    () => validFavorites.filter((fav) => fav.productType === "Listing"),
    [validFavorites],
  );

  const sectionClass =
    "rounded-2xl border border-gray-200 bg-white p-4 sm:p-6 shadow-sm";

  if (!validFavorites.length) {
    return (
      <section className={sectionClass}>
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-14 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-white text-rose-500 shadow-sm">
            <Heart size={20} />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">No favorites yet</h2>
          <p className="mt-2 text-sm text-gray-500">
            Save services or listings you like and they will show up here.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Browse listings
          </Link>
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className={sectionClass}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">My Favorites</h2>
            <p className="mt-1 text-sm text-gray-500">
              Quick access to the services and listings you saved.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700">
            <Sparkles size={14} />
            {validFavorites.length} saved
          </div>
        </div>
      </section>

      {favoriteServices.length > 0 && (
        <section className={sectionClass}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Favorite Services</h3>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
              {favoriteServices.length}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {favoriteServices.map((fav) => {
              const service = fav.productId;
              const serviceImage = service?.photos?.[0]?.url || service?.imageUrl;
              const serviceName =
                service?.businessName || service?.serviceType || service?.name || "Unnamed Service";
              return (
                <article
                  key={fav._id}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative aspect-[16/10] bg-gray-100">
                    {serviceImage ? (
                      <Image
                        src={serviceImage}
                        alt={serviceName}
                        fill
                        className="object-cover transition group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex items-end justify-between gap-3 p-3">
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-sm font-semibold text-gray-900">{serviceName}</p>
                      <p className="text-sm font-semibold text-indigo-600">
                        ${service?.hourlyRate || 0}/hr
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFavorite(fav._id)}
                      className="inline-flex shrink-0 cursor-pointer items-center rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {favoriteListings.length > 0 && (
        <section className={sectionClass}>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Favorite Listings</h3>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
              {favoriteListings.length}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {favoriteListings.map((fav) => {
              const listing = fav.productId;
              const imageUrl = listing?.photos?.[0]?.url || listing?.imageUrl;
              const listingName = listing?.itemName || listing?.name || "Unnamed Listing";
              return (
                <article
                  key={fav._id}
                  className="group overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative aspect-[16/10] bg-gray-100">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={listingName}
                        fill
                        className="object-cover transition group-hover:scale-[1.02]"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-gray-400">
                        No image
                      </div>
                    )}
                  </div>
                  <div className="flex items-end justify-between gap-3 p-3">
                    <div className="min-w-0 space-y-1">
                      <p className="truncate text-sm font-semibold text-gray-900">{listingName}</p>
                      <p className="text-sm font-semibold text-indigo-600">
                        ${listing?.dailyRate || listing?.hourlyRate || 0}/day
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFavorite(fav._id)}
                      className="inline-flex shrink-0 cursor-pointer items-center rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-600 transition hover:bg-rose-100"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      <section className={sectionClass}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-gray-600">Want to add more favorites?</p>
          <Link
            href="/"
            className="inline-flex items-center rounded-xl border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
          >
            Browse more
          </Link>
        </div>
      </section>
    </div>
  );
}
