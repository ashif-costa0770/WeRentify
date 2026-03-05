"use client";

import { useEffect, useState } from "react";
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
    deletingId: actionLoadingId,
    onDelete: handleDeleteService,
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Services</h1>
        <p className="mt-1 text-sm text-slate-500">Manage all platform services</p>
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
