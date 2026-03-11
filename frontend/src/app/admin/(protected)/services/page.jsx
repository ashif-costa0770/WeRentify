"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

import ServicesTable from "./components/services-table";
import { getServicesColumns } from "./components/services-columns";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "/backend-api").replace(
  /\/+$/,
  ""
);

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    async function fetchServices() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "10",
          search,
        });
        const res = await fetch(`${API_URL}/admin/services?${params.toString()}`, {
          credentials: "include",
          cache: "no-store",
        });
        const payload = await res.json().catch(() => null);

        if (!res.ok || !payload?.success) {
          throw new Error(payload?.message || "Failed to fetch services");
        }

        if (cancelled) return;

        const rows = Array.isArray(payload?.data?.services)
          ? payload.data.services
          : Array.isArray(payload?.data)
            ? payload.data
            : [];
        const nextPagination = payload?.data?.pagination || payload?.pagination || {};

        setServices(rows);
        setPagination({
          total: nextPagination?.total ?? rows.length,
          page: nextPagination?.page ?? page,
          pages: Math.max(nextPagination?.pages ?? 1, 1),
        });
      } catch (fetchError) {
        if (!cancelled) {
          setServices([]);
          setError(fetchError.message || "Failed to fetch services");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchServices();
    return () => {
      cancelled = true;
    };
  }, [page, search]);

  const currentPage = pagination.page || page;
  const totalPages = pagination.pages || 1;
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handleToggleFeaturedService = async (serviceId, isCurrentlyFeatured) => {
    const nextFeatured = !isCurrentlyFeatured;

    setError("");
    setActionLoadingId(serviceId);
    // Optimistic update for instant UI feedback.
    setServices((prev) =>
      prev.map((service) =>
        service?._id === serviceId ? { ...service, isFeatured: nextFeatured } : service
      )
    );

    try {
      const res = await fetch(
        `${API_URL}/admin/services/${serviceId}/toggle-featured`,
        {
          method: "PATCH",
          credentials: "include",
          cache: "no-store",
        }
      );
      const payload = await res.json().catch(() => null);

      if (!res.ok || !payload?.success) {
        throw new Error(payload?.message || "Failed to update featured status");
      }

      toast.success(
        nextFeatured
          ? "Service marked as featured."
          : "Service removed from featured."
      );
    } catch (actionError) {
      // Revert optimistic update on failure.
      setServices((prev) =>
        prev.map((service) =>
          service?._id === serviceId
            ? { ...service, isFeatured: isCurrentlyFeatured }
            : service
        )
      );
      setError(actionError.message || "Failed to update featured status");
      toast.error(actionError.message || "Failed to update featured status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleToggleServiceStatus = async (serviceId, isCurrentlyActive) => {
    const nextIsActive = !isCurrentlyActive;

    setError("");
    setActionLoadingId(serviceId);
    // Optimistic update for instant UI feedback.
    setServices((prev) =>
      prev.map((service) =>
        service?._id === serviceId
          ? { ...service, status: nextIsActive ? "active" : "inactive" }
          : service
      )
    );

    try {
      const res = await fetch(`${API_URL}/admin/services/${serviceId}/toggle-status`, {
        method: "PATCH",
        credentials: "include",
        cache: "no-store",
      });
      const payload = await res.json().catch(() => null);

      if (!res.ok || !payload?.success) {
        throw new Error(payload?.message || "Failed to update service status");
      }
      toast.success(nextIsActive ? "Service activated successfully." : "Service deactivated successfully.");
    } catch (actionError) {
      // Revert optimistic update on failure.
      setServices((prev) =>
        prev.map((service) =>
          service?._id === serviceId
            ? { ...service, status: isCurrentlyActive ? "active" : "inactive" }
            : service
        )
      );
      setError(actionError.message || "Failed to update service status");
      toast.error(actionError.message || "Failed to update service status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteService = async (serviceId) => {
    const previousServices = services;
    const previousPagination = pagination;
    const serviceExists = previousServices.some((item) => item?._id === serviceId);
    if (!serviceExists) return;

    setError("");
    setActionLoadingId(serviceId);

    setServices((prev) => prev.filter((item) => item?._id !== serviceId));
    setPagination((prev) => ({
      ...prev,
      total: Math.max((prev?.total ?? 0) - 1, 0),
    }));

    try {
      const res = await fetch(`${API_URL}/admin/services/${serviceId}`, {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
      });
      const payload = await res.json().catch(() => null);

      if (!res.ok || !payload?.success) {
        throw new Error(payload?.message || "Failed to delete service");
      }
      toast.success("Service deleted successfully.");
    } catch (actionError) {
      setServices(previousServices);
      setPagination(previousPagination);
      setError(actionError.message || "Failed to delete service");
      toast.error(actionError.message || "Failed to delete service");
    } finally {
      setActionLoadingId(null);
    }
  };

  const columns = getServicesColumns({
    actionLoadingId,
    onDelete: handleDeleteService,
    onToggleStatus: handleToggleServiceStatus,
    onToggleFeatured: handleToggleFeaturedService,
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Services</h1>
          <p className="mt-1 text-sm text-slate-500">Manage all platform services</p>
        </div>
        <div className="relative w-full md:w-[280px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search services..."
            className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <ServicesTable
        columns={columns}
        data={services}
        loading={loading}
        sorting={sorting}
        onSortingChange={setSorting}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        currentPage={currentPage}
        totalPages={totalPages}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        onPreviousPage={() => setPage((prev) => Math.max(prev - 1, 1))}
        onNextPage={() =>
          setPage((prev) => Math.min(prev + 1, pagination.pages || prev + 1))
        }
      />
    </section>
  );
}
