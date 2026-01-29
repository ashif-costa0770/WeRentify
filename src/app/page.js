"use client";

import { useMemo, useState } from "react";
import NavbarWrapper from "@/components/navbar/NavbarWrapper";
import ItemCategoriesSection from "@/components/CategoryGrid/ItemCategoriesSection";
import ItemGrid from "@/components/itemCards/ItemGrid";
import FiltersSlicer from "@/components/modals/FiltersSlicer";
import ProductModal from "@/components/modals/ProductModal";
import { items } from "@/data/listingsData";
import MessageSlider from "@/components/modals/MessageSlider";
import OwnerProfileModal from "@/components/modals/OwnerProfileModal";

export default function ListingPage() {
  /* ---------------- CATEGORY ---------------- */
  const [selectedCategory, setSelectedCategory] = useState("all");

  /* ---------------- FILTERS ---------------- */
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("nearest");
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [distanceFilter, setDistanceFilter] = useState(10);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  /* ---------------- MESSAGES ---------------- */
  const [showMessages, setShowMessages] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);

  /* ---------------- PRODUCT MODAL ---------------- */
  const [selectedItem, setSelectedItem] = useState(null);

  /* ---------------- OwnerProfile MODAL ---------------- */
  const [showOwnerProfile, setShowOwnerProfile] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);

  /* ---------------- FAVORITES ---------------- */
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id],
    );
  };

  /* ---------------- FILTER + SORT LOGIC ---------------- */
  const filteredItems = useMemo(() => {
    let result = [...items];

    // Category
    if (selectedCategory !== "all") {
      result = result.filter((item) => item.category === selectedCategory);
    }

    // Price
    result = result.filter(
      (item) =>
        item.dailyRate >= priceRange[0] && item.dailyRate <= priceRange[1],
    );

    // Distance
    result = result.filter((item) => item.distance <= distanceFilter);

    // Verified
    if (verifiedOnly) {
      result = result.filter((item) => item.verified);
    }

    // Sorting
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

      {/* Category Tabs */}
      <ItemCategoriesSection
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />

      {/* Listings Grid */}
      <ItemGrid
        items={filteredItems}
        favorites={favorites}
        toggleFavorite={toggleFavorite}
        onOpenFilters={() => setShowFilters(true)}
        onSelect={(item) => setSelectedItem(item)} // ✅ opens modal
      />

      {/* Filters Drawer */}
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

      {/* Product Modal */}
      {selectedItem && (
        <ProductModal
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          items={items}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
          setShowMessages={setShowMessages}
          setSelectedConversation={setSelectedConversation}
          onViewOwner={(ownerData) => {
            setSelectedOwner(ownerData);
            setShowOwnerProfile(true);
          }}
        />
      )}

      <MessageSlider
        showMessages={showMessages}
        setShowMessages={setShowMessages}
        selectedConversation={selectedConversation}
      />

      <OwnerProfileModal
        show={showOwnerProfile}
        onClose={() => setShowOwnerProfile(false)}
        owner={selectedOwner}
        items={items}
        onSelectItem={(item) => {
          setShowOwnerProfile(false);
          setSelectedItem(item);
        }}
      />
    </main>
  );
}
