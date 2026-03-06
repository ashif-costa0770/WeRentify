"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import ListingsTable from "./components/listings-table";
import { getListingsColumns } from "./components/listings-columns";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "/backend-api").replace(
  /\/+$/,
  ""
);

export default function ListingsPage() {
  const [listings, setListings] = useState([]);
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

    async function fetchListings() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "10",
          search,
        });
        const res = await fetch(`${API_URL}/admin/listings?${params.toString()}`, {
          credentials: "include",
          cache: "no-store",
        });
        const payload = await res.json().catch(() => null);

        if (!res.ok || !payload?.success) {
          throw new Error(payload?.message || "Failed to fetch listings");
        }

        if (cancelled) return;

        const rows = Array.isArray(payload?.data?.listings)
          ? payload.data.listings
          : Array.isArray(payload?.data)
            ? payload.data
            : [];
        const nextPagination = payload?.data?.pagination || payload?.pagination || {};

        setListings(rows);
        setPagination({
          total: nextPagination?.total ?? rows.length,
          page: nextPagination?.page ?? page,
          pages: Math.max(nextPagination?.pages ?? 1, 1),
        });
      } catch (fetchError) {
        if (!cancelled) {
          setListings([]);
          setError(fetchError.message || "Failed to fetch listings");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchListings();

    return () => {
      cancelled = true;
    };
  }, [page, search]);

  const currentPage = pagination.page || page;
  const totalPages = pagination.pages || 1;
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handleToggleListingStatus = async (listingId, isCurrentlyActive) => {
    const nextIsActive = !isCurrentlyActive;
    setError("");
    setActionLoadingId(listingId);
    // Optimistic update for instant UI feedback.
    setListings((prev) =>
      prev.map((item) =>
        item?._id === listingId
          ? { ...item, status: nextIsActive ? "active" : "inactive" }
          : item
      )
    );

    try {
      const res = await fetch(`${API_URL}/admin/listings/${listingId}/toggle-status`, {
        method: "PATCH",
        credentials: "include",
        cache: "no-store",
      });
      const payload = await res.json().catch(() => null);

      if (!res.ok || !payload?.success) {
        throw new Error(payload?.message || "Failed to update listing status");
      }
      toast.success(nextIsActive ? "Listing activated successfully." : "Listing deactivated successfully.");
    } catch (actionError) {
      setListings((prev) =>
        prev.map((item) =>
          item?._id === listingId
            ? { ...item, status: isCurrentlyActive ? "active" : "inactive" }
            : item
        )
      );
      setError(actionError.message || "Failed to update listing status");
      toast.error(actionError.message || "Failed to update listing status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteListing = async (listingId) => {
    const previousListings = listings;
    const previousPagination = pagination;
    const listingExists = previousListings.some((item) => item?._id === listingId);
    if (!listingExists) return;

    setError("");
    setActionLoadingId(listingId);

    setListings((prev) => prev.filter((item) => item?._id !== listingId));
    setPagination((prev) => ({
      ...prev,
      total: Math.max((prev?.total ?? 0) - 1, 0),
    }));

    try {
      const res = await fetch(`${API_URL}/admin/listings/${listingId}`, {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
      });
      const payload = await res.json().catch(() => null);

      if (!res.ok || !payload?.success) {
        throw new Error(payload?.message || "Failed to delete listing");
      }
      toast.success("Listing deleted successfully.");
    } catch (actionError) {
      setListings(previousListings);
      setPagination(previousPagination);
      setError(actionError.message || "Failed to delete listing");
      toast.error(actionError.message || "Failed to delete listing");
    } finally {
      setActionLoadingId(null);
    }
  };

  const columns = getListingsColumns({
    actionLoadingId: actionLoadingId,
    onDelete: handleDeleteListing,
    onToggleStatus: handleToggleListingStatus,
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Listings</h1>
        <p className="mt-1 text-sm text-slate-500">Manage all platform listings</p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <ListingsTable
        columns={columns}
        data={listings}
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
