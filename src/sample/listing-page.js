"use client";

import { useState } from "react";
import ItemCategoriesSection from "@/components/CategoryGrid/ItemCategoriesSection";
import ItemGrid from "@/components/itemCards/ItemGrid";
import { items } from "@/data/listingsData";
import NavbarWrapper from "@/components/navbar/NavbarWrapper";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredItems =
    selectedCategory === "all"
      ? items
      : items.filter((item) => item.category === selectedCategory);

  return (
    <>
      <main className="relative">
        <NavbarWrapper />
        {/* Sticky navbar */}
        <ItemCategoriesSection
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
        <ItemGrid items={filteredItems} />
      </main>
    </>
  );
}
