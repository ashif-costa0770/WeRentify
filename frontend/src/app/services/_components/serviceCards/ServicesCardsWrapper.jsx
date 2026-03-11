"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import ServiceCategoryBlock from "./ServiceCategoryBlock";
import GlobalServicesHeader from "./GlobalServicesHeader";

export default function ServicesCardsWrapper({
  services,
  featuredServices = [],
  selectedCategory,
  sortBy,
  onSortChange,
  loading = false,
  error = null,
}) {
  const router = useRouter();

  const openServicePage = (service) => {
    const serviceId = service?._id || service?.id;
    if (!serviceId) return;
    router.push(`/services/${serviceId}`);
  };

  // 🔹 Group services by category
  const groupedServices = useMemo(() => {
    return services.reduce((acc, service) => {
      const key = service.category; // categoryId

      if (!acc[key]) {
        acc[key] = {
          name: service.categoryName || "Other", // ✅ use real name
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
      {/* ⭐ Featured Services section (filtered + sorted) */}
      {Array.isArray(featuredServices) && featuredServices.length > 0 && (
        <section className="mt-2 mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-gray-900">
              <span>⭐</span>
              
              Featured Services ({featuredServices.length})
            </h2>
            {/* Sort control aligned to the right of Featured heading */}
            <GlobalServicesHeader
              totalCount={totalServicesCount}
              sortBy={sortBy}
              onSortChange={onSortChange}
            />
          </div>
          {/* Reuse the same horizontal scroller & cards for consistency */}
          <ServiceCategoryBlock
            categoryLabel="Featured"
            services={featuredServices}
            onServiceClick={openServicePage}
          />
        </section>
      )}

      {/* ✅ Normal services heading */}
      <h2 className="mb-4 mt-2 text-xl font-semibold text-gray-900">
        All Services ({totalServicesCount})
      </h2>

      {/* ✅ Category sections */}
      {visibleCategories.length === 0 ? (
        <p className="text-center text-gray-500 py-12">No services found.</p>
      ) : (
        visibleCategories.map(([key, group]) => (
          <ServiceCategoryBlock
            key={key}
            categoryLabel={group.name}
            services={group.items}
            onServiceClick={openServicePage}
          />
        ))
      )}
    </div>
  );
}
