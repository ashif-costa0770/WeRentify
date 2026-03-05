"use client";
import React from "react";
import { Suspense } from "react";
import Navbar from "@/app/_components/navbar/Navbar";
import ServicesSearch from "./ServicesSearch";

export default function ServicesNavbarWrapper() {
  return (
    <div className="sticky top-0 z-50 bg-gray-100 pb-4 shadow-lg mx-auto">
      <Suspense fallback={null}>
        <Navbar />
      </Suspense>
      <ServicesSearch />
    </div>
  );
}
