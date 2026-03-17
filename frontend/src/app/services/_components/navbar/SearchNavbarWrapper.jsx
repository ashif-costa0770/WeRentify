"use client";

import { Suspense } from "react";
import Navbar from "@/app/_components/navbar/Navbar";

export default function ServicesNavbarWrapper() {
  return (
    <div className="sticky top-0 z-50 bg-gray-100 shadow-lg mx-auto">
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>
    </div>
  );
}
