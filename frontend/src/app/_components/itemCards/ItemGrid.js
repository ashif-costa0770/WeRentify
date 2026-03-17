"use client";

import { useEffect, useState } from "react";
import ListingHeader from "./ListingHeader";
import ItemCard from "./ItemCard";
import { getListings } from "@/services/item.service";

export default function ItemGrid({
  items = undefined,
  isMobile = false,
  onSelect = () => {},
  onOpenFilters = () => {},
  showFilterButton = true,
  searchLocation = null,
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
      setError(null);

      try {
        const res = await getListings();
        const list =
          res?.data?.data?.listings ||
          res?.data?.listings ||
          res?.data?.data ||
          res?.data ||
          [];

        if (!mounted) return;
        setListings(Array.isArray(list) ? list : []);
      } catch (err) {
        if (!mounted) return;
        setError(err?.response?.data?.message || "Failed to load listings");
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

  // Keep grid updated when parent sends filtered items.
  useEffect(() => {
    if (items === undefined) return;
    setListings(Array.isArray(items) ? items : []);
  }, [items]);

  const safeItems = Array.isArray(listings) ? listings : [];

  return (
    <section className="max-w-7xl mx-auto px-4 mt-6">
      <ListingHeader
        isMobile={isMobile}
        totalItems={safeItems.length}
        onOpenFilters={onOpenFilters}
        showFilterButton={showFilterButton}
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
          {searchLocation
            ? `No listings found in ${searchLocation.charAt(0).toUpperCase()}${searchLocation.slice(1).toLowerCase()}.`
            : "No items found"}
        </div>
      )}
    </section>
  );
}
