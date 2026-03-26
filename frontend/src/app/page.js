"use client";

// Force dynamic rendering so build doesn't try to statically export this page
// (we rely on useSearchParams and client-side redirects).
export const dynamic = "force-dynamic";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import nextDynamic from "next/dynamic";
import NavbarWrapper from "@/app/_components/navbar/NavbarWrapper";
import { getListings, getFeaturedListings } from "@/services/item.service";

const ItemCategoriesSection = nextDynamic(
  () => import("@/app/_components/CategoryGrid/ItemCategoriesSection"),
  {
    loading: () => (
      <section className="max-w-7xl mx-auto px-4 mt-5">
        <div className="mb-4 h-12 rounded-2xl bg-gray-100 animate-pulse" />
        <div className="h-20 rounded-2xl bg-gray-100 animate-pulse" />
      </section>
    ),
  },
);
const FeaturedListingsSection = nextDynamic(
  () => import("@/app/_components/itemCards/FeaturedListingsSection"),
  {
    loading: () => (
      <section className="max-w-7xl mx-auto px-4 mt-8">
        <div className="mb-4 h-6 w-56 rounded bg-gray-100 animate-pulse" />
        <div className="grid gap-4 mb-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, idx) => (
            <div key={idx} className="h-56 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      </section>
    ),
  },
);
const ItemGrid = nextDynamic(() => import("@/app/_components/itemCards/ItemGrid"), {
  loading: () => (
    <section className="max-w-7xl mx-auto px-4 mt-6 mb-6">
      <div className="mb-4 h-6 w-44 rounded bg-gray-100 animate-pulse" />
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, idx) => (
          <div key={idx} className="h-56 rounded-2xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    </section>
  ),
});
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
  const [searchLocation, setSearchLocation] = useState(null);

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
  const [featuredOnly, setFeaturedOnly] = useState(false);

  /* ---------------- STATE: UI MODALS ---------------- */
  const [showMessages, setShowMessages] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showOwnerProfile, setShowOwnerProfile] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [featuredItems, setFeaturedItems] = useState([]);

  /* ---------------- FETCH ITEMS FROM BACKEND (with optional location) ---------------- */
  const fetchItems = useCallback(async (locationParam = null) => {
    setBackendLoading(true);
    setBackendError(null);
    const loc = locationParam ?? searchLocation;

    try {
      const res = await getListings(loc ? { location: loc } : {});
      const list =
        res?.data?.data?.listings ||
        res?.data?.listings ||
        res?.data?.data ||
        res?.data ||
        [];

      setItems(Array.isArray(list) ? list : []);
    } catch (err) {
      const message = err?.response?.data?.message;
      // Treat \"no listings found\" from backend as a valid empty state, not an error.
      // The UI will show a friendly, location-aware empty state instead.
      if (message && /no listings found/i.test(message)) {
        setBackendError(null);
      } else {
        setBackendError(message || "Failed to load items");
      }
      setItems([]);
    } finally {
      setBackendLoading(false);
    }
  }, [searchLocation]);

  const fetchFeaturedItems = useCallback(async (locationParam = null) => {
    const loc = locationParam ?? searchLocation;
    try {
      const res = await getFeaturedListings(loc ? { location: loc } : {});
      const data =
        res?.data?.data?.listings ??
        res?.data?.listings ??
        res?.data?.data ??
        res?.data ??
        [];
      setFeaturedItems(Array.isArray(data) ? data : []);
    } catch {
      setFeaturedItems([]);
    }
  }, [searchLocation]);

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

    // Featured-only: hide non-featured grid when enabled
    if (featuredOnly) {
      return [];
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
    featuredOnly,
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

  /* ---------------- EFFECTS: fetch when URL location changes ---------------- */
  useEffect(() => {
    Promise.all([fetchItems(), fetchFeaturedItems()]);
  }, [fetchItems, fetchFeaturedItems]);

  // Keep `searchLocation` in sync without useSearchParams()
  useEffect(() => {
    if (typeof window === "undefined") return;

    const readFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const loc = params.get("location");
      return loc && loc.trim() ? loc.trim() : null;
    };

    // Initial load
    setSearchLocation(readFromUrl());

    // Back/forward navigation
    const onPopState = () => setSearchLocation(readFromUrl());
    window.addEventListener("popstate", onPopState);

    // Searches triggered from HeroSearch (router.push won't fire popstate)
    const onHeroSearch = (e) => {
      const nextLoc = e?.detail?.location;
      setSearchLocation(nextLoc && String(nextLoc).trim() ? String(nextLoc).trim() : null);
    };
    window.addEventListener("werentify:location-search", onHeroSearch);

    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("werentify:location-search", onHeroSearch);
    };
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
    <main className="relative pb-20">
      <NavbarWrapper />
      {/* Category Tabs */}
      <ItemCategoriesSection
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
        onListingCreated={fetchItems}
      />

      {/* Featured Listings */}
      {Array.isArray(featuredItems) && featuredItems.length > 0 && (
        <FeaturedListingsSection
          visibleFeaturedItems={visibleFeaturedItems}
          onOpenFilters={() => setShowFilters(true)}
          onSelectItem={(item) => router.push(`/listing/${item._id || item.id}`)}
        />
      )}

      {/* Listings Grid */}
      {!featuredOnly &&
        (backendLoading ? (
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
            onOpenFilters={
              featuredItems.length > 0 ? undefined : () => setShowFilters(true)
            }
            showFilterButton={featuredItems.length === 0}
            onSelect={(item) => router.push(`/listing/${item._id || item.id}`)}
            searchLocation={searchLocation}
          />
        ))}

      {/* Filters Drawer */}
      {showFilters && (
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
          featuredOnly={featuredOnly}
          setFeaturedOnly={setFeaturedOnly}
          onApply={handleApplyFilters}
        />
      )}

      {showMessages && (
        <MessageSlider
          showMessages={showMessages}
          setShowMessages={setShowMessages}
          selectedConversation={selectedConversation}
        />
      )}

      {showOwnerProfile && (
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
      )}
    </main>
  );
}
