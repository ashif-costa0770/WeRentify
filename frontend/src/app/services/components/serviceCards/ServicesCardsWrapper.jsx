"use client";

import { useMemo, useState } from "react";
import { categoryMap } from "@/data/servicesData";
import ServiceCategoryBlock from "./ServiceCategoryBlock";
import GlobalServicesHeader from "./GlobalServicesHeader";
import ServiceModal from "../modals/ServiceModal";

export default function ServicesCardsWrapper({
  services,
  selectedCategory,
  sortBy,
  onSortChange,
  loading = false,
  error = null,
}) {
  // 🔹 Modal state
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openServiceModal = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  const closeServiceModal = () => {
    setIsModalOpen(false);
    setSelectedService(null);
  };

  // 🔹 Group services by category
  const groupedServices = useMemo(() => {
    return services.reduce((acc, service) => {
      const key = service.category;

      if (!acc[key]) {
        acc[key] = {
          name: categoryMap[key] || key,
          items: [],
        };
      }

      acc[key].items.push(service);
      return acc;
    }, {});
  }, [services]);

  // 🔹 Decide which categories to render
  const visibleCategories = useMemo(() => {
    if (selectedCategory === "all") {
      return Object.entries(groupedServices);
    }

    return Object.entries(groupedServices).filter(
      ([category]) => category === selectedCategory,
    );
  }, [groupedServices, selectedCategory]);

  // 🔹 Total visible services count
  const totalServicesCount = useMemo(() => {
    return visibleCategories.reduce(
      (sum, [, group]) => sum + group.items.length,
      0,
    );
  }, [visibleCategories]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 pb-16 flex flex-col items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
        <p className="mt-4 text-gray-600">Loading services...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 pb-16 flex flex-col items-center justify-center min-h-[300px]">
        <p className="text-red-600 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16">
      {/* ✅ GLOBAL HEADER (only once) */}
      <GlobalServicesHeader
        totalCount={totalServicesCount}
        sortBy={sortBy}
        onSortChange={onSortChange}
      />

      {/* ✅ Category sections */}
      {visibleCategories.length === 0 ? (
        <p className="text-center text-gray-500 py-12">No services found.</p>
      ) : (
        visibleCategories.map(([key, group]) => (
          <ServiceCategoryBlock
            key={key}
            categoryLabel={group.name}
            services={group.items}
            onServiceClick={openServiceModal}
          />
        ))
      )}

      {/* ✅ Service Modal (render once) */}
      {isModalOpen && selectedService && (
        <ServiceModal service={selectedService} onClose={closeServiceModal} />
      )}
    </div>
  );
}
