"use client";

import { useMemo, useState, useEffect, useCallback } from "react"; // ✅ useCallback added
import ServicesNavbarWrapper from "./components/navbar/SearchNavbarWrapper";
import ServicesGridWrapper from "./components/serviceGrid/ServiceGridWrapper";
import ServicesCardsWrapper from "./components/serviceCards/ServicesCardsWrapper";
import { getServices } from "@/services/services.service";
import ListBusinessModal from "./components/modals/ListBusinessModal";
import { useListBusiness } from "@/context/ListBusinessContext"; // ✅ added

function mapBackendService(service) {
  const categoryName = service.category?.name || "other";
  const categoryId = service.category?._id || service.category?.toString?.() || null;
  const iconUrl = service.category?.icon.url || service.category?.toString?.() || "other";
  const hourlyRateNum = parseFloat(service.hourlyRate) || 0;
  const providerName =
    `${service.owner?.firstname || ""} ${service.owner?.lastname || ""}`.trim() ||
    service.owner?.firstname ||
    "Provider";
  return {
    ...service,
    id: service._id,
    name: service.businessName || service.serviceType || "Unnamed Service",
    imageUrl: service.photos?.[0]?.url || "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=400&h=300&fit=crop",
    hourlyRate: service.hourlyRate,
    _hourlyRateNum: hourlyRateNum,
    rating: service.rating ?? 0,
    description: service.description ?? "Professional service with guaranteed quality",
    reviews: service.reviewCount ?? 0,
    verified: service.verified,
    provider: providerName,
    categoryName:categoryName,
    category: categoryId,
    distance: service.serviceRadius ?? 0,
    image: iconUrl,
  };
}

export default function ServicesPage() {
  const { registerSuccessCallback } = useListBusiness(); // ✅

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recommended");

  // ✅ Extracted as useCallback so it's stable and can be passed as a callback
  const fetchServices = useCallback(async () => {
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
  }, []);

  // ✅ Initial fetch on mount
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // ✅ Register fetchServices so context can call it after a successful submit
  useEffect(() => {
    registerSuccessCallback(fetchServices);
  }, [fetchServices, registerSuccessCallback]);

  const filteredServices = useMemo(() => {
    if (selectedCategory === "all") return services;
    return services.filter((service) => service.category === selectedCategory);
  }, [selectedCategory, services]);

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
        return data;
    }
  }, [filteredServices, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <ServicesNavbarWrapper />
      <ServicesGridWrapper
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
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
