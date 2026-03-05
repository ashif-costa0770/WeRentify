"use client";

import { useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import NavbarWrapper from "@/app/_components/navbar/NavbarWrapper";
import ItemCategoriesSection from "@/app/_components/CategoryGrid/ItemCategoriesSection";
import ItemGrid from "@/app/_components/itemCards/ItemGrid";
import { getListings } from "@/services/item.service";

const FiltersSlicer = dynamic(
  () => import("@/app/_components/modals/FiltersSlicer"),
  {
    ssr: false,
  },
);
const ProductModal = dynamic(
  () => import("@/app/_components/modals/ProductModal"),
  {
    ssr: false,
  },
);
const MessageSlider = dynamic(
  () => import("@/app/_components/modals/MessageSlider"),
  {
    ssr: false,
  },
);
const OwnerProfileModal = dynamic(
  () => import("@/app/_components/modals/OwnerProfileModal"),
  { ssr: false },
);

export default function ListingPage() {
  /* ---------------- STATE: LISTINGS & FETCHING ---------------- */
  const [items, setItems] = useState([]);
  const [backendLoading, setBackendLoading] = useState(true);
  const [backendError, setBackendError] = useState(null);

  /* ---------------- STATE: FILTERS ---------------- */
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("nearest");
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [distanceFilter, setDistanceFilter] = useState(1000);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  /* ---------------- STATE: UI MODALS ---------------- */
  const [showMessages, setShowMessages] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showOwnerProfile, setShowOwnerProfile] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);

  /* ---------------- FETCH ITEMS FROM BACKEND (Simple) ---------------- */
  const fetchItems = async () => {
    setBackendLoading(true);
    setBackendError(null);

    try {
      const res = await getListings();
      const list =
        res?.data?.data?.listings ||
        res?.data?.listings ||
        res?.data?.data ||
        res?.data ||
        [];

      setItems(Array.isArray(list) ? list : []);
    } catch (err) {
      setBackendError(err?.response?.data?.message || "Failed to load items");
      setItems([]);
    } finally {
      setBackendLoading(false);
    }
  };

  /* ---------------- FILTER + SORT (Simple frontend logic) ---------------- */
  const visibleItems = useMemo(() => {
    let result = [...items];

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter((item) => {
        const catId = item?.category?._id || item?.category;
        return String(catId) === String(selectedCategory);
      });
    }

    // Price filter (Daily price as per filter label)
    result = result.filter((item) => {
      const price = Number(item?.dailyRate || item?.hourlyRate || 0);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    // Distance filter
    result = result.filter((item) => {
      const distance = Number.parseFloat(item?.distance ?? 0);
      return distance <= distanceFilter;
    });

    // Verified filter
    if (verifiedOnly) {
      result = result.filter((item) => Boolean(item?.verified));
    }

    // Sort
    if (sortBy === "priceLow") {
      result.sort(
        (a, b) =>
          Number(a?.dailyRate || a?.hourlyRate || 0) -
          Number(b?.dailyRate || b?.hourlyRate || 0),
      );
    } else if (sortBy === "priceHigh") {
      result.sort(
        (a, b) =>
          Number(b?.dailyRate || b?.hourlyRate || 0) -
          Number(a?.dailyRate || a?.hourlyRate || 0),
      );
    } else if (sortBy === "rating") {
      result.sort((a, b) => Number(b?.rating || 0) - Number(a?.rating || 0));
    } else if (sortBy === "nearest") {
      result.sort(
        (a, b) =>
          Number.parseFloat(a?.distance ?? 0) -
          Number.parseFloat(b?.distance ?? 0),
      );
    }

    return result;
  }, [
    items,
    selectedCategory,
    priceRange,
    distanceFilter,
    verifiedOnly,
    sortBy,
  ]);

  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    fetchItems();
  }, []);

  // Handle Apply Filters from Slicer
  const handleApplyFilters = () => {
    setShowFilters(false);
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
          items={visibleItems}
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
