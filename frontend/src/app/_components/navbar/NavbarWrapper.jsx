"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import HeroSearch from "./HeroSearch";
import Navbar from "./Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();
  const isSingleListingPage = pathname?.match(/^\/listing\/[^/]+$/);

  return (
    <div className={`sticky top-0 z-10 bg-gray-100 shadow-lg ${!isSingleListingPage ? "pb-3" : ""}`}>
      <Suspense fallback={null}>
        <Navbar />
        {!isSingleListingPage && <HeroSearch />}
      </Suspense>
    </div>
  );
}
