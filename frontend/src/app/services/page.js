"use client";

import { useMemo, useState, useEffect } from "react";
import ServicesNavbarWrapper from "./components/navbar/SearchNavbarWrapper";
import ServicesGridWrapper from "./components/serviceGrid/ServiceGridWrapper";
import ServicesCardsWrapper from "./components/serviceCards/ServicesCardsWrapper";
import { getServices } from "@/services/services.service";
import ListBusinessModal from "./components/modals/ListBusinessModal";

// Map backend service to frontend card format
function mapBackendService(service) {
  const categorySlug = service.category?.slug || service.category?.toString?.() || "other";
  const iconUrl = service.category?.icon.url || service.category?.toString?.() || "other";
  const hourlyRateNum = parseFloat(service.hourlyRate) || 0;
  return {
    ...service,
    id: service._id,
    name: service.businessName || service.serviceType || "Unnamed Service",
    imageUrl: service.photos?.[0]?.url || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop",
    hourlyRate: service.hourlyRate,
    _hourlyRateNum: hourlyRateNum, // for sorting
    rating: service.rating ?? 0,
    description:service.description ?? "Professional service with guaranteed quality",
    reviews: service.reviewCount ?? 0,
    verified: service.verified,
    provider: service.owner?.name || "Provider",
    category: categorySlug,
    distance: service.serviceRadius ?? 0,
    image:iconUrl

  };
}

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 filter + sort state
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recommended");

  // 🔹 fetch services from backend
  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await getServices();
        const list = res.data?.data?.services || res.data?.services || [];
        setServices(list.map(mapBackendService));
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load services");
        setServices([]);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  // 🔹 filter by category
  const filteredServices = useMemo(() => {
    if (selectedCategory === "all") return services;
    return services.filter((service) => service.category === selectedCategory);
  }, [selectedCategory, services]);

  // 🔹 sort services
  const sortedServices = useMemo(() => {
    const data = [...filteredServices];

    switch (sortBy) {
      case "highest_rated":
        return data.sort((a, b) => b.rating - a.rating);

      case "price_low_high":
        return data.sort((a, b) => (a._hourlyRateNum || 0) - (b._hourlyRateNum || 0));

      case "price_high_low":
        return data.sort((a, b) => (b._hourlyRateNum || 0) - (a._hourlyRateNum || 0));

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
        loading={loading}
        error={error}
      />

      <ListBusinessModal />
    </div>
  );
}
