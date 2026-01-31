"use client";

import { useMemo, useState } from "react";
import ServicesNavbarWrapper from "./components/navbar/SearchNavbarWrapper";
import ServicesGridWrapper from "./components/serviceGrid/ServiceGridWrapper";
import ServicesCardsWrapper from "./components/serviceCards/ServicesCardsWrapper";
import { services } from "@/data/servicesData"; // adjust path if needed
import ListBusinessModal from "./components/modals/ListBusinessModal";

export default function ServicesPage() {
  // 🔹 filter + sort state
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recommended");

  /* ---------------- FAVORITES ---------------- */
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (id) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fav) => fav !== id) : [...prev, id],
    );
  };

  // 🔹 filter by category
  const filteredServices = useMemo(() => {
    if (selectedCategory === "all") return services;
    return services.filter((service) => service.category === selectedCategory);
  }, [selectedCategory]);

  // 🔹 sort services
  const sortedServices = useMemo(() => {
    const data = [...filteredServices];

    switch (sortBy) {
      case "highest_rated":
        return data.sort((a, b) => b.rating - a.rating);

      case "price_low_high":
        return data.sort((a, b) => a.hourlyRate - b.hourlyRate);

      case "price_high_low":
        return data.sort((a, b) => b.hourlyRate - a.hourlyRate);

      default:
        return data; // recommended
    }
  }, [filteredServices, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <ServicesNavbarWrapper />

      {/* 🔹 Top category grid */}
      <ServicesGridWrapper
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* 🔹 Services list */}
      <ServicesCardsWrapper
        services={sortedServices}
        selectedCategory={selectedCategory}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      <ListBusinessModal />
    </div>
  );
}
