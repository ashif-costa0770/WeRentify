"use client";

import { useMemo, useState, useEffect, useCallback } from "react"; // âœ… useCallback added
import ServicesNavbarWrapper from "./_components/navbar/SearchNavbarWrapper";
import ServicesGridWrapper from "./_components/serviceGrid/ServiceGridWrapper";
import ServicesCardsWrapper from "./_components/serviceCards/ServicesCardsWrapper";
import { getServices } from "@/services/services.service";
import ListBusinessModal from "./_components/modals/ListBusinessModal";
import { useListBusiness } from "@/context/ListBusinessContext"; // âœ… added
import { mapBackendService } from "./_lib/mapBackendService";

export default function ServicesPage() {
  const { registerSuccessCallback } = useListBusiness(); // âœ…

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recommended");

  // âœ… Extracted as useCallback so it's stable and can be passed as a callback
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

  // âœ… Initial fetch on mount
  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  // âœ… Register fetchServices so context can call it after a successful submit
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
