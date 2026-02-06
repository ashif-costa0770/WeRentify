"use client";

import { useEffect, useState } from "react";
import ListingHeader from "./ListingHeader";
import ItemCard from "./ItemCard";
import { items as allItems } from "@/data/listingsData";
import { getListings } from "@/utils/api";

export default function ItemGrid({
  items = undefined,
  isMobile = false,
  onSelect = () => {},
  onOpenFilters = () => {},
}) {
  const [listings, setListings] = useState(items ?? allItems ?? []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // If no items prop is provided, fetch from backend
  useEffect(() => {
    if (items !== undefined) return; // parent provided items — do nothing

    let mounted = true;
    const fetchListings = async () => {
      setLoading(true);
      try {
        const res = await getListings({ page: 1, limit: 20 });
        if (!mounted) return;
        setListings(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        if (!mounted) return;
        setError(err.message || "Failed to load listings");
        setListings([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchListings();

    return () => {
      mounted = false;
    };
  }, [items]);

  const safeItems = Array.isArray(listings) ? listings : [];

  return (
    <section className="max-w-7xl mx-auto px-4 mt-8">
      <ListingHeader
        isMobile={isMobile}
        totalItems={safeItems.length}
        onOpenFilters={onOpenFilters}
      />

      {loading ? (
        <div className="py-16 text-center text-gray-500 font-medium">
          Loading...
        </div>
      ) : error ? (
        <div className="py-16 text-center text-red-500 font-medium">
          {error}
        </div>
      ) : safeItems.length > 0 ? (
        <div
          className={`grid gap-4 mb-6
            ${
              isMobile
                ? "grid-cols-2"
                : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            }
          `}
        >
          {safeItems.map((item) => (
            <ItemCard
              key={item._id || item.id}
              item={item}
              onSelect={onSelect}
            />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center text-gray-500 font-medium">
          No items found
        </div>
      )}
    </section>
  );
}
