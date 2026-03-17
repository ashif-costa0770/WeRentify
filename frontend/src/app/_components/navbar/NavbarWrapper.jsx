"use client";

import { Suspense } from "react";
import Navbar from "./Navbar";

export default function NavbarWrapper() {
  return (
    <div className="sticky top-0 z-10 bg-gray-100 shadow-lg">
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>
    </div>
  );
}
