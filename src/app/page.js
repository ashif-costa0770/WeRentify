"use client";

import { useMemo, useState } from "react";
import NavbarWrapper from "@/components/navbar/NavbarWrapper";
import ItemCategoriesSection from "@/components/CategoryGrid/ItemCategoriesSection";
import ItemGrid from "@/components/itemCards/ItemGrid";
import FiltersSlicer from "@/components/modals/FiltersSlicer";
import ProductModal from "@/components/modals/ProductModal";
import { items } from "@/data/listingsData";

export default function Home() {
  // 🔹 Category
  const [selectedCategory, setSelectedCategory] = useState("all");

  // 🔹 Filter slicer state
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("nearest");
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [distanceFilter, setDistanceFilter] = useState(10);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // 🔹 Product modal state
  const [selectedItem, setSelectedItem] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);

  // 🔥 CATEGORY → FILTERS → SORT
  const filteredItems = useMemo(() => {
    let result = [...items];

    // 1️⃣ Category filter
    if (selectedCategory !== "all") {
      result = result.filter((item) => item.category === selectedCategory);
    }

    // 2️⃣ Daily price filter
    result = result.filter(
      (item) =>
        item.dailyRate >= priceRange[0] && item.dailyRate <= priceRange[1],
    );

    // 3️⃣ Distance filter
    result = result.filter((item) => item.distance <= distanceFilter);

    // 4️⃣ Verified owners only
    if (verifiedOnly) {
      result = result.filter((item) => item.verified);
    }

    // 5️⃣ Sorting
    switch (sortBy) {
      case "priceLow":
        result.sort((a, b) => a.dailyRate - b.dailyRate);
        break;
      case "priceHigh":
        result.sort((a, b) => b.dailyRate - a.dailyRate);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "nearest":
        result.sort((a, b) => a.distance - b.distance);
        break;
      default:
        break;
    }

    return result;
  }, [selectedCategory, sortBy, priceRange, distanceFilter, verifiedOnly]);

  return (
    <main className="relative">
      <NavbarWrapper />

      {/* Category tabs */}
      <ItemCategoriesSection
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      {/* Items + filter button */}
      <ItemGrid
        items={filteredItems}
        onOpenFilters={() => setShowFilters(true)}
        onSelect={(item) => {
          setSelectedItem(item);
          setShowProductModal(true);
        }}
      />

      {/* Filters drawer */}
      <FiltersSlicer
        showFilters={showFilters}
        onClose={() => setShowFilters(false)}
        sortBy={sortBy}
        setSortBy={setSortBy}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        distanceFilter={distanceFilter}
        setDistanceFilter={setDistanceFilter}
        verifiedOnly={verifiedOnly}
        setVerifiedOnly={setVerifiedOnly}
      />

      {/* Product modal */}
      <ProductModal
        item={selectedItem}
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
      />
    </main>
  );
}
