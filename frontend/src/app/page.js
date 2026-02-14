"use client";

import { useMemo, useState, useEffect } from "react";
import NavbarWrapper from "@/components/navbar/NavbarWrapper";
import ItemCategoriesSection from "@/components/CategoryGrid/ItemCategoriesSection";
import ItemGrid from "@/components/itemCards/ItemGrid";
import FiltersSlicer from "@/components/modals/FiltersSlicer";
import ProductModal from "@/components/modals/ProductModal";
import MessageSlider from "@/components/modals/MessageSlider";
import OwnerProfileModal from "@/components/modals/OwnerProfileModal";
import { getListings } from "@/services/item.service";

export default function ListingPage() {
  /* ---------------- STATE: LISTINGS & FETCHING ---------------- */
  const [items, setItems] = useState([]);
  const [backendLoading, setBackendLoading] = useState(true);
  const [backendError, setBackendError] = useState(null);

  /* ---------------- STATE: FILTERS ---------------- */
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("nearest");
  const [priceRange, setPriceRange] = useState([0, 200]);
  const [distanceFilter, setDistanceFilter] = useState(10);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  /* ---------------- STATE: UI MODALS ---------------- */
  const [showMessages, setShowMessages] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showOwnerProfile, setShowOwnerProfile] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);

  /* ---------------- FETCH ITEMS FROM BACKEND ---------------- */
  const fetchItems = async () => {
    setBackendLoading(true);
    try {
      const params = {
        page: 1,
        limit: 100,
      };

      // Add Category
      if (selectedCategory !== "all") {
        params.category = selectedCategory;
      }

      // Add Price Range
      // Assuming backend supports minPrice and maxPrice
      if (priceRange[0] > 0) params.minPrice = priceRange[0];
      if (priceRange[1] < 1000) params.maxPrice = priceRange[1]; // Only send max if it's reasonable, or always send if UI enforces it.

      // Add Sorting
      // Map frontend sort keys to backend keys if necessary.
      // Backend expects: sortBy = "createdAt" | "hourlyRate" | etc.
      // Backend expects: order = "asc" | "desc"
      if (sortBy === "priceLow") {
        params.sortBy = "hourlyRate";
        params.order = "asc";
      } else if (sortBy === "priceHigh") {
        params.sortBy = "hourlyRate";
        params.order = "desc";
      } else if (sortBy === "nearest") {
        // Backend specific field for nearest? Or handle later?
        // If backend doesn't support geo-sorting yet, we might fallback or send it.
        // For now, let's keep 'createdAt' or omit to use default.
      } else if (sortBy === "rating") {
        params.sortBy = "rating";
        params.order = "desc";
      }

      // Add Other Filters
      if (verifiedOnly) {
        // Assuming backend supports this or we ignore it for now if not supported.
        // params.verified = true;
      }

      const res = await getListings(params);
      setItems(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setBackendError(err.message || "Failed to load items");
      setItems([]);
    } finally {
      setBackendLoading(false);
    }
  };

  /* ---------------- EFFECTS ---------------- */
  // Fetch on mount or when key filters change immediately (Category)
  // For other filters (Price, Sort), we can decide to fetch immediately or wait for "Apply" in the Slicer.
  // The user requirement implies "Apply" might be explicit for the slicer, but Category is usually instant.
  // Let's stick to the plan: Category & Sort trigger fetch. Slicer 'Apply' triggers fetch.

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategory, sortBy]); // Trigger re-fetch when category or sort changes

  // Handle Apply Filters from Slicer
  const handleApplyFilters = () => {
    setShowFilters(false);
    fetchItems();
  };

  return (
    <main className="relative">
      <NavbarWrapper />

      {/* Category Tabs */}
      <ItemCategoriesSection
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        onListingCreated={fetchItems}
      />

      {/* Listings Grid */}
      {backendLoading ? (
        <div className="py-16 text-center text-gray-500 font-medium">
          Loading items...
        </div>
      ) : backendError ? (
        <div className="py-16 text-center text-red-500 font-medium">
          {backendError}
        </div>
      ) : (
        <ItemGrid
          items={items} // Directly use fetched items
          onOpenFilters={() => setShowFilters(true)}
          onSelect={(item) => setSelectedItem(item)}
        />
      )}

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
        onApply={handleApplyFilters} // Pass apply handler
      />

      {/* Product Modal */}
      {selectedItem && (
        <ProductModal
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          items={items}
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
