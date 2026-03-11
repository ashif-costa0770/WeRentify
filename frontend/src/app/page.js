"use client";

// Force dynamic rendering so build doesn't try to statically export this page
// (we rely on useSearchParams and client-side redirects).
export const dynamic = "force-dynamic";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import nextDynamic from "next/dynamic";
import NavbarWrapper from "@/app/_components/navbar/NavbarWrapper";
import ItemCategoriesSection from "@/app/_components/CategoryGrid/ItemCategoriesSection";
import ItemGrid from "@/app/_components/itemCards/ItemGrid";
import ItemCard from "@/app/_components/itemCards/ItemCard";
import { SlidersHorizontal } from "lucide-react";
import { getListings, getFeaturedListings } from "@/services/item.service";

const FiltersSlicer = nextDynamic(
  () => import("@/app/_components/modals/FiltersSlicer"),
  {
    ssr: false,
  },
);
const MessageSlider = nextDynamic(
  () => import("@/app/_components/modals/MessageSlider"),
  {
    ssr: false,
  },
);
const OwnerProfileModal = nextDynamic(
  () => import("@/app/_components/modals/OwnerProfileModal"),
  { ssr: false },
);

export default function ListingPage() {
  const router = useRouter();

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
  const [showOwnerProfile, setShowOwnerProfile] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [featuredItems, setFeaturedItems] = useState([]);

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

  const fetchFeaturedItems = async () => {
    try {
      const res = await getFeaturedListings();
      const data =
        res?.data?.data ??
        res?.data ??
        [];
      setFeaturedItems(Array.isArray(data) ? data : []);
    } catch {
      setFeaturedItems([]);
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

  /* ---------------- FILTER + SORT for featured (same logic) ---------------- */
  const visibleFeaturedItems = useMemo(() => {
    let result = [...(Array.isArray(featuredItems) ? featuredItems : [])];

    if (selectedCategory !== "all") {
      result = result.filter((item) => {
        const catId = item?.category?._id || item?.category;
        return String(catId) === String(selectedCategory);
      });
    }

    result = result.filter((item) => {
      const price = Number(item?.dailyRate || item?.hourlyRate || 0);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    result = result.filter((item) => {
      const distance = Number.parseFloat(item?.distance ?? 0);
      return distance <= distanceFilter;
    });

    if (verifiedOnly) {
      result = result.filter((item) => Boolean(item?.verified));
    }

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
    featuredItems,
    selectedCategory,
    priceRange,
    distanceFilter,
    verifiedOnly,
    sortBy,
  ]);

  /* ---------------- EFFECTS ---------------- */
  useEffect(() => {
    fetchItems();
    fetchFeaturedItems();
  }, []);

  // Redirect shared links (?item=id) to the listing page
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const itemId = params.get("item");
    if (itemId) {
      router.replace(`/listing/${itemId}`);
    }
  }, [router]);

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

      {/* Featured Listings */}
      {Array.isArray(featuredItems) && featuredItems.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-1.5">
                <span>⭐</span> Featured Items ({visibleFeaturedItems.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(true)}
              className="flex cursor-pointer items-center gap-2 rounded-full border-2 border-gray-300 bg-white px-3 py-2 text-xs font-bold text-gray-800 shadow-md hover:bg-gray-50"
            >
              <SlidersHorizontal size={14} />
              Filters
            </button>
          </div>
          <div className="grid gap-4 mb-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {visibleFeaturedItems.length > 0 ? (
              visibleFeaturedItems.map((item) => (
                <ItemCard
                  key={item._id || item.id}
                  item={item}
                  onSelect={(it) => router.push(`/listing/${it._id || it.id}`)}
                />
              ))
            ) : (
              <p className="col-span-full py-8 text-center text-sm text-gray-500">
                No featured items match your current filters.
              </p>
            )}
          </div>
        </section>
      )}

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
          onOpenFilters={featuredItems.length > 0 ? undefined : () => setShowFilters(true)}
          showFilterButton={featuredItems.length === 0}
          onSelect={(item) => router.push(`/listing/${item._id || item.id}`)}
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
          router.push(`/listing/${item._id || item.id}`);
        }}
      />
    </main>
  );
}
