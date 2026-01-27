"use client";

import ListingHeader from "./ListingHeader";
import ItemCard from "./ItemCard";
import { items as allItems } from "@/data/listingsData";

export default function ItemGrid({
  items = allItems,
  isMobile = false,
  favorites = [],
  toggleFavorite = () => {},
  onSelect = () => {},
  onOpenFilters = () => {},
}) {
  const safeItems = Array.isArray(items) ? items : [];

  return (
    <section className="max-w-7xl mx-auto px-4 mt-8">
      {/* Header */}
      <ListingHeader
        isMobile={isMobile}
        totalItems={safeItems.length}
        onOpenFilters={onOpenFilters}
      />

      {/* Grid */}
      {safeItems.length > 0 ? (
        <div
          className={`grid ${
            isMobile ? "grid-cols-2" : "grid-cols-5"
          } gap-4 mb-4`}
        >
          {safeItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              favorites={favorites}
              toggleFavorite={toggleFavorite}
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
