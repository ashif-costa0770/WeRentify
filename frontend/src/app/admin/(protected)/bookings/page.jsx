"use client";

import { useEffect, useMemo, useState } from "react";

import AdminGuard from "../AdminGuard";
import { toast } from "sonner";
import BookingsTable from "./components/bookings-table";
import { getBookingColumns } from "./components/booking-coloumn";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "/backend-api").replace(
 /\/+$/,
 "",
);

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
  });
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch bookings from admin API
  useEffect(() => {
    let cancelled = false;

    async function fetchBookings() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "10",
        });

        const res = await fetch(
          `${API_URL}/admin/bookings?${params.toString()}`,
          {
            credentials: "include",
            cache: "no-store",
          },
        );
        const payload = await res.json().catch(() => null);

        if (!res.ok || !payload?.success) {
          throw new Error(payload?.message || "Failed to fetch bookings");
        }

        if (cancelled) return;

        const data = payload?.data;
        const rows = Array.isArray(data?.bookings)
          ? data.bookings
          : Array.isArray(data)
          ? data
          : [];
        const nextPagination = data?.pagination || payload?.pagination || {};

        setBookings(rows);
        setPagination({
          total: nextPagination?.total ?? rows.length,
          page: nextPagination?.page ?? page,
          pages: Math.max(
            nextPagination?.totalPages ?? nextPagination?.pages ?? 1,
            1,
          ),
        });
      } catch (err) {
        if (!cancelled) {
          setBookings([]);
          const msg = err.message || "Failed to fetch bookings";
          setError(msg);
          toast.error(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchBookings();
    return () => {
      cancelled = true;
    };
  }, [page]);

  async function updateStatus(bookingId, status, successMsg) {
    setActionLoadingId(bookingId);
    try {
      const res = await fetch(
        `${API_URL}/admin/bookings/${bookingId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status }),
        },
      );
      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload?.success) {
        throw new Error(payload?.message || "Action failed");
      }
      setBookings((prev) =>
        prev.map((b) => (b._id === bookingId ? { ...b, status } : b)),
      );
      toast.success(successMsg);
    } catch (err) {
      toast.error(err.message || "Action failed");
    } finally {
      setActionLoadingId(null);
    }
  }

  const handleConfirmBooking = (bookingId) =>
    updateStatus(bookingId, "confirmed", "Booking confirmed");

  const handleCancelBooking = (bookingId) =>
    updateStatus(bookingId, "cancelled", "Booking cancelled");

  const getResourceTitle = (row) => {
    const r = row?.resource;
    if (!r) return "";
    return (r.itemName || r.businessName || r.title || "").toString();
  };

  const getBookingTypeLabel = (row) => {
    const raw =
      row?.bookingType ??
      (row?.resourceModel && String(row.resourceModel).toLowerCase());
    if (!raw) return "";
    const t = String(raw).toLowerCase();
    if (t === "service") return "Service";
    if (t === "listing") return "Listing";
    return String(raw);
  };

  const getUserName = (user) => {
    if (!user) return "";
    const first = user.firstname || "";
    const last = user.lastname || "";
    const full = `${first} ${last}`.trim();
    return (full || user.email || "").toString();
  };

  // Apply search on client side
  const filteredData = useMemo(() => {
    const term = search.toLowerCase();
    if (!term) return bookings;

    return bookings.filter((row) => {
      const title = getResourceTitle(row).toLowerCase();
      const type = getBookingTypeLabel(row).toLowerCase();
      const providerName = getUserName(row.provider).toLowerCase();
      const customerName = getUserName(row.customer).toLowerCase();

      return (
        title.includes(term) ||
        type.includes(term) ||
        providerName.includes(term) ||
        customerName.includes(term)
      );
    });
  }, [bookings, search]);

  const currentPage = pagination.page || page;
  const totalPages = pagination.pages || 1;
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const columns = useMemo(
    () =>
      getBookingColumns({
        onConfirm: handleConfirmBooking,
        onCancel: handleCancelBooking,
        actionLoadingId,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [actionLoadingId],
  );

  return (
    <AdminGuard>
      <section className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Bookings</h1>
          <p className="mt-1 text-sm text-slate-500">
            View all bookings for services and listings.
          </p>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <BookingsTable
          columns={columns}
          data={filteredData}
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
            setPage((prev) =>
              Math.min(prev + 1, pagination.pages || prev + 1),
            )
          }
        />
      </section>
    </AdminGuard>
  );
}