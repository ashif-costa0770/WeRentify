"use client";

import { useMemo, useState, useEffect, useCallback } from "react"; // âœ… useCallback added
import ServicesNavbarWrapper from "./_components/navbar/SearchNavbarWrapper";
import ServicesGridWrapper from "./_components/serviceGrid/ServiceGridWrapper";
import ServicesCardsWrapper from "./_components/serviceCards/ServicesCardsWrapper";
import { getServices, getFeaturedServices } from "@/services/services.service";
import ListBusinessModal from "./_components/modals/ListBusinessModal";
import { useListBusiness } from "@/context/ListBusinessContext"; // âœ… added
import { mapBackendService } from "./_lib/mapBackendService";

export default function ServicesPage() {
  const { registerSuccessCallback } = useListBusiness(); // âœ…

  const [services, setServices] = useState([]);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [servicesError, setServicesError] = useState(null);
  const [featuredError, setFeaturedError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recommended");

  // âœ… Extracted as useCallback so it's stable and can be passed as a callback
  const fetchServices = useCallback(async () => {
    try {
      setServicesLoading(true);
      setServicesError(null);
      const res = await getServices();
      const list = res.data?.data?.services || res.data?.services || [];
      setServices(list.map(mapBackendService));
    } catch (err) {
      setServicesError(
        err.response?.data?.message || "Failed to load services",
      );
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  }, []);

  const fetchFeaturedServices = useCallback(async () => {
    try {
      setFeaturedLoading(true);
      setFeaturedError(null);
      const res = await getFeaturedServices();
      const list =
        res.data?.data?.services ||
        res.data?.services ||
        res.data?.data ||
        res.data ||
        [];
      setFeaturedServices(list.map(mapBackendService));
    } catch (err) {
      setFeaturedError(
        err.response?.data?.message || "Failed to load featured services",
      );
      setFeaturedServices([]);
    } finally {
      setFeaturedLoading(false);
    }
  }, []);

  // âœ… Initial fetch on mount
  useEffect(() => {
    fetchServices();
    fetchFeaturedServices();
  }, [fetchServices, fetchFeaturedServices]);

  // âœ… Register fetchServices so context can call it after a successful submit
  useEffect(() => {
    registerSuccessCallback(fetchServices);
  }, [fetchServices, registerSuccessCallback]);

  const filteredServices = useMemo(() => {
    // Remove services that are already featured so we don't render duplicates
    const baseServices = (() => {
      if (!featuredServices.length) return services;
      const featuredIds = new Set(
        featuredServices.map((service) => service.id || service._id),
      );
      return services.filter((service) => !featuredIds.has(service.id));
    })();

    if (selectedCategory === "all") return baseServices;
    return baseServices.filter(
      (service) => service.category === selectedCategory,
    );
  }, [selectedCategory, services, featuredServices]);

  const sortedServices = useMemo(() => {
    const data = [...filteredServices];
    switch (sortBy) {
      case "highest_rated":
        return data.sort((a, b) => b.rating - a.rating);
      case "price_low_high":
        return data.sort(
          (a, b) => (a._hourlyRateNum || 0) - (b._hourlyRateNum || 0),
        );
      case "price_high_low":
        return data.sort(
          (a, b) => (b._hourlyRateNum || 0) - (a._hourlyRateNum || 0),
        );
      default:
        return data;
    }
  }, [filteredServices, sortBy]);

  // Apply same category filter + sort to featured services
  const visibleFeaturedServices = useMemo(() => {
    const data = [...featuredServices];

    const categoryFiltered =
      selectedCategory === "all"
        ? data
        : data.filter((service) => service.category === selectedCategory);

    switch (sortBy) {
      case "highest_rated":
        return [...categoryFiltered].sort((a, b) => b.rating - a.rating);
      case "price_low_high":
        return [...categoryFiltered].sort(
          (a, b) => (a._hourlyRateNum || 0) - (b._hourlyRateNum || 0),
        );
      case "price_high_low":
        return [...categoryFiltered].sort(
          (a, b) => (b._hourlyRateNum || 0) - (a._hourlyRateNum || 0),
        );
      default:
        return categoryFiltered;
    }
  }, [featuredServices, selectedCategory, sortBy]);

  const loading = servicesLoading || featuredLoading;
  const error = servicesError || featuredError;

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <ServicesNavbarWrapper />
      <ServicesGridWrapper
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <ServicesCardsWrapper
        services={sortedServices}
        featuredServices={visibleFeaturedServices}
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
