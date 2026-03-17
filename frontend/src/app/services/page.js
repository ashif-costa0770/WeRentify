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
  const { registerSuccessCallback } = useListBusiness();

  const [searchLocation, setSearchLocation] = useState(() => {
    if (typeof window === "undefined") return null;
    const p = new URLSearchParams(window.location.search);
    const loc = p.get("location");
    return loc && loc.trim() ? loc.trim() : null;
  });
  const [services, setServices] = useState([]);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [featuredLoading, setFeaturedLoading] = useState(true);
  const [servicesError, setServicesError] = useState(null);
  const [featuredError, setFeaturedError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recommended");

  const fetchServices = useCallback(async (locationParam = null) => {
    const loc = locationParam ?? searchLocation;
    try {
      setServicesLoading(true);
      setServicesError(null);
      const res = await getServices(loc ? { location: loc } : {});
      const list = res.data?.data?.services || res.data?.services || [];
      setServices(list.map(mapBackendService));
    } catch (err) {
      const message = err?.response?.data?.message;
      // Treat \"no services found\" from backend as a valid empty state, not an error
      if (message && /no services found/i.test(message)) {
        setServicesError(null);
      } else {
        setServicesError(message || "Failed to load services");
      }
      setServices([]);
    } finally {
      setServicesLoading(false);
    }
  }, [searchLocation]);

  const fetchFeaturedServices = useCallback(async (locationParam = null) => {
    const loc = locationParam ?? searchLocation;
    try {
      setFeaturedLoading(true);
      setFeaturedError(null);
      const res = await getFeaturedServices(loc ? { location: loc } : {});
      const list =
        res.data?.data?.services ||
        res.data?.services ||
        res.data?.data ||
        res.data ||
        [];
      setFeaturedServices(list.map(mapBackendService));
    } catch (err) {
      const message = err?.response?.data?.message;
      // Treat \"no featured services found\" as a valid empty state, not an error
      if (message && /no featured services found/i.test(message)) {
        setFeaturedError(null);
      } else {
        setFeaturedError(message || "Failed to load featured services");
      }
      setFeaturedServices([]);
    } finally {
      setFeaturedLoading(false);
    }
  }, [searchLocation]);

  useEffect(() => {
    fetchServices();
    fetchFeaturedServices();
  }, [searchLocation]);

  // Sync searchLocation with URL (no useSearchParams): initial, back/forward, and HeroSearch event
  useEffect(() => {
    if (typeof window === "undefined") return;
    const readFromUrl = () => {
      const params = new URLSearchParams(window.location.search);
      const loc = params.get("location");
      return loc && loc.trim() ? loc.trim() : null;
    };
    setSearchLocation(readFromUrl());
    const onPopState = () => setSearchLocation(readFromUrl());
    window.addEventListener("popstate", onPopState);
    const onHeroSearch = (e) => {
      const nextLoc = e?.detail?.location;
      setSearchLocation(
        nextLoc && String(nextLoc).trim() ? String(nextLoc).trim() : null,
      );
    };
    window.addEventListener("werentify:location-search", onHeroSearch);
    return () => {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener("werentify:location-search", onHeroSearch);
    };
  }, []);

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
        searchLocation={searchLocation}
      />
      <ListBusinessModal />
    </div>
  );
}
