"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin } from "lucide-react";

export default function HeroSearch() {
  const router = useRouter();
  const [location, setLocation] = useState("");

  const readLocationFromUrl = () => {
    if (typeof window === "undefined") return "";
    const params = new URLSearchParams(window.location.search);
    return params.get("location") ?? "";
  };

  // Sync input with URL (initial + back/forward)
  useEffect(() => {
    setLocation(readLocationFromUrl());

    const onPopState = () => setLocation(readLocationFromUrl());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const handleSearch = (e) => {
    e?.preventDefault?.();
    const trimmed = location?.trim() ?? "";
    const path = trimmed ? `/?location=${encodeURIComponent(trimmed)}` : "/";
    router.push(path);

    // App Router query changes don't fire popstate; notify pages to refetch.
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("werentify:location-search", {
          detail: { location: trimmed },
        }),
      );
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6">
      <div className="relative pb-2">
        {/* Desktop / Tablet */}
        <form
          onSubmit={handleSearch}
          className="hidden md:block max-w-sm mx-auto"
        >
          <div className="group flex items-center gap-3 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-gray-200 focus-within:shadow-lg focus-within:border-[#a855f7]/40 focus-within:ring-2 focus-within:ring-[#a855f7]/20 transition-all duration-200 px-4 py-2">
            <MapPin className="flex-shrink-0 w-5 h-5 text-gray-400 group-focus-within:text-[#a855f7] transition-colors" strokeWidth={2} />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Find items by location"
              className="flex-1 min-w-0 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
              aria-label="Search by location"
            />
            <button
              type="submit"
              className="cursor-pointer flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r from-[#a855f7] to-[#9333ea] text-white flex items-center justify-center shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              aria-label="Search"
            >
              <Search className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>
        </form>

        {/* Mobile */}
        <div className="md:hidden max-w-[280px] mx-auto space-y-3">
          <form onSubmit={handleSearch} className="space-y-3">
            <div className="flex items-center gap-3 bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3">
              <MapPin className="flex-shrink-0 w-5 h-5 text-gray-400" strokeWidth={2} />
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Search for items to rent nearby"
                className="flex-1 min-w-0 text-sm text-gray-800 placeholder-gray-400 outline-none bg-transparent"
                aria-label="Search by location"
              />
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#a855f7] to-[#9333ea] text-white font-medium text-sm flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform"
            >
              <Search className="w-5 h-5" strokeWidth={2.5} />
              Search
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
