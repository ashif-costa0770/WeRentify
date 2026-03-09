"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Loader2,
  MoreHorizontal,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getMyBookings,
  getBookingById,
  updateBookingStatus,
} from "@/services/booking.service";
import { toast } from "sonner";

const PAGE_SIZE = 10;

function getTitle(booking) {
  const r = booking?.resource;
  if (!r) return "—";
  return r.itemName || r.businessName || "—";
}

function getBookingTypeLabel(booking) {
  const raw =
    booking?.bookingType ??
    (booking?.resourceModel && booking.resourceModel.toLowerCase());
  if (!raw) return "—";
  const t = String(raw).toLowerCase();
  return t === "service" ? "Service" : t === "listing" ? "Listing" : raw;
}

function getProviderName(booking) {
  const p = booking?.provider;
  if (!p) return "—";
  const first = p.firstname || "";
  const last = p.lastname || "";
  return `${first} ${last}`.trim() || "—";
}

function formatPrice(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatStatusLabel(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ");
  if (!normalized) return "Unknown";
  return normalized.replace(/\b\w/g, (char) => char.toUpperCase());
}

function getBookingStatusBadgeClass(status) {
  const normalized = String(status || "").trim().toLowerCase();
  const base = "border px-2.5 py-0.5 text-[11px] font-semibold";

  if (["confirmed", "completed"].includes(normalized)) {
    return `${base} border-emerald-200 bg-emerald-50 text-emerald-700`;
  }
  if (["accepted", "in progress", "in_progress"].includes(normalized)) {
    return `${base} border-blue-200 bg-blue-50 text-blue-700`;
  }
  if (normalized === "pending") {
    return `${base} border-amber-200 bg-amber-50 text-amber-700`;
  }
  if (["cancelled", "canceled", "rejected", "failed"].includes(normalized)) {
    return `${base} border-rose-200 bg-rose-50 text-rose-700`;
  }
  return `${base} border-gray-200 bg-gray-100 text-gray-700`;
}

function getPaymentStatusBadgeClass(status) {
  const normalized = String(status || "").trim().toLowerCase();
  const base = "border px-2.5 py-0.5 text-[11px] font-semibold";

  if (normalized === "paid") {
    return `${base} border-emerald-200 bg-emerald-50 text-emerald-700`;
  }
  if (normalized === "pending") {
    return `${base} border-amber-200 bg-amber-50 text-amber-700`;
  }
  if (["refunded", "partially refunded", "partially_refunded"].includes(normalized)) {
    return `${base} border-violet-200 bg-violet-50 text-violet-700`;
  }
  if (["failed", "declined"].includes(normalized)) {
    return `${base} border-rose-200 bg-rose-50 text-rose-700`;
  }
  if (["unpaid", "due"].includes(normalized)) {
    return `${base} border-slate-200 bg-slate-100 text-slate-700`;
  }
  return `${base} border-gray-200 bg-gray-100 text-gray-700`;
}

function BookingDetailsModal({ bookingId, onClose }) {
  const [loading, setLoading] = useState(!!bookingId);
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!bookingId) {
      setBooking(null);
      setError("");
      return;
    }
    setLoading(true);
    setError("");
    getBookingById(bookingId)
      .then((res) => {
        const data = res?.data?.data;
        setBooking(data || null);
      })
      .catch((err) => {
        setError(err?.response?.data?.message || "Failed to load booking");
        setBooking(null);
      })
      .finally(() => setLoading(false));
  }, [bookingId]);

  if (!bookingId) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Booking Details
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="px-6 py-4 overflow-y-auto flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin text-indigo-600" />
            </div>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : booking ? (
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Title</dt>
                <dd className="font-medium text-gray-900">
                  {getTitle(booking)}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Type</dt>
                <dd>{getBookingTypeLabel(booking)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Provider</dt>
                <dd>{getProviderName(booking)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Total Price</dt>
                <dd>{formatPrice(booking.totalPrice)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Booking Status</dt>
                <dd>
                  <Badge className={getBookingStatusBadgeClass(booking.status)}>
                    {formatStatusLabel(booking.status)}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Payment Status</dt>
                <dd>
                  <Badge className={getPaymentStatusBadgeClass(booking.paymentStatus)}>
                    {formatStatusLabel(booking.paymentStatus)}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Booking Date</dt>
                <dd>
                  {booking.bookingDate
                    ? formatDate(booking.bookingDate)
                    : booking.startDate
                      ? `${formatDate(booking.startDate)} – ${formatDate(booking.endDate)}`
                      : formatDate(booking.createdAt)}
                </dd>
              </div>
              {booking.timeSlot && (
                <div>
                  <dt className="text-gray-500">Time Slot</dt>
                  <dd>{booking.timeSlot}</dd>
                </div>
              )}
            </dl>
          ) : null}
        </div>
        <div className="px-6 py-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="w-full sm:w-auto"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function MyBookings() {
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [viewBookingId, setViewBookingId] = useState(null);
  const [sorting, setSorting] = useState([{ id: "bookingDate", desc: true }]);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getMyBookings();
      const data = res?.data?.data;
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to load bookings";
      setError(msg);
      if (err?.response?.status !== 404) {
        toast.error(msg);
      }
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookings();
  }, [loadBookings]);

  const filteredData = useMemo(() => {
    const term = searchValue.trim().toLowerCase();
    if (!term) return bookings;

    return bookings.filter((booking) => {
      const title = getTitle(booking).toLowerCase();
      const typeLabel = getBookingTypeLabel(booking).toLowerCase();
      const provider = getProviderName(booking).toLowerCase();

      return (
        title.includes(term) ||
        typeLabel.includes(term) ||
        provider.includes(term)
      );
    });
  }, [bookings, searchValue]);

  const isCancellable = (booking) => {
    const status = String(booking?.status || "").toLowerCase();
    return ["pending", "accepted", "confirmed"].includes(status);
  };

  const handleViewBooking = (bookingId) => {
    if (!bookingId) return;
    router.push(`/profile/bookings/${bookingId}`);
  };

  const handleCancelBooking = async (booking) => {
    if (!booking?._id || !isCancellable(booking)) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking? This action cannot be undone.",
    );
    if (!confirmed) return;

    try {
      await updateBookingStatus(booking._id, {
        status: "cancelled",
        cancelledBy: "customer",
      });
      toast.success("Booking cancelled successfully");
      await loadBookings();
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to cancel booking";
      toast.error(msg);
    }
  };

  const columns = useMemo(
    () => [
      {
        accessorFn: (row) => getTitle(row),
        id: "title",
        header: "Title",
        cell: ({ row }) => (
          <button
            type="button"
            onClick={() => handleViewBooking(row.original._id)}
            className="text-indigo-600 hover:text-indigo-700 hover:underline cursor-pointer font-medium"
          >
            {getTitle(row.original)}
          </button>
        ),
        enableSorting: true,
      },
      {
        accessorFn: (row) =>
          String(
            row?.bookingType ||
              (row?.resourceModel && row.resourceModel.toLowerCase()) ||
              "",
          ).toLowerCase(),
        id: "bookingType",
        header: "Booking Type",
        cell: ({ row }) => getBookingTypeLabel(row.original),
        enableSorting: true,
      },
      {
        accessorFn: (row) => getProviderName(row),
        id: "providerName",
        header: "Provider Name",
        cell: ({ row }) => getProviderName(row.original),
        enableSorting: true,
      },
      {
        accessorKey: "totalPrice",
        header: "Price",
        cell: ({ row }) => formatPrice(row.original.totalPrice),
        enableSorting: true,
      },
      {
        accessorKey: "status",
        header: "Booking Status",
        cell: ({ row }) => (
          <Badge className={getBookingStatusBadgeClass(row.original.status)}>
            {formatStatusLabel(row.original.status)}
          </Badge>
        ),
        enableSorting: true,
      },
      {
        accessorKey: "paymentStatus",
        header: "Payment Status",
        cell: ({ row }) => (
          <Badge className={getPaymentStatusBadgeClass(row.original.paymentStatus)}>
            {formatStatusLabel(row.original.paymentStatus)}
          </Badge>
        ),
        enableSorting: true,
      },
      {
        accessorFn: (row) => {
          const b = row;
          const date = b.bookingDate || b.startDate || b.createdAt;
          return date ? new Date(date).getTime() : 0;
        },
        id: "bookingDate",
        header: "Booking Date",
        cell: ({ row }) => {
          const b = row.original;
          const date = b.bookingDate || b.startDate || b.createdAt;
          return formatDate(date);
        },
        enableSorting: true,
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const booking = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="cursor-pointer"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleViewBooking(booking._id)}
                  className="cursor-pointer"
                >
                  View booking
                </DropdownMenuItem>
                {isCancellable(booking) && (
                  <DropdownMenuItem
                    variant="destructive"
                    className="cursor-pointer"
                    onClick={() => handleCancelBooking(booking)}
                  >
                    Cancel booking
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
        enableSorting: false,
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: PAGE_SIZE } },
  });

  const rows = table.getRowModel().rows;
  const pageCount = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex + 1;
  const canGoPrevious = table.getCanPreviousPage();
  const canGoNext = table.getCanNextPage();

  return (
    <div className="space-y-4 min-w-0">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          My Bookings
        </h1>
        <p className="text-sm text-gray-500 mb-4">
          View all your bookings for services and listings.
        </p>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-4">
          <Input
            id="booking-search"
            placeholder="Search bookings by title, type, or provider..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="w-full sm:max-w-md border-gray-300 bg-white text-gray-800 placeholder:text-gray-500 shadow-sm focus-visible:border-indigo-400 focus-visible:ring-indigo-200"
          />
        </div>

        <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
          <Table className="min-w-max min-w-[1200px]">
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="px-4 py-3 first:pl-6 last:pr-6"
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={header.column.getToggleSortingHandler()}
                          className="-ml-2 h-8 px-2 cursor-pointer"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {header.column.getIsSorted() === "asc" ? (
                            <ChevronUp className="size-4" />
                          ) : header.column.getIsSorted() === "desc" ? (
                            <ChevronDown className="size-4" />
                          ) : (
                            <ArrowUpDown className="size-4 opacity-50" />
                          )}
                        </Button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-gray-500"
                  >
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-5 animate-spin" />
                      Loading bookings...
                    </span>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-red-600"
                  >
                    {error}
                  </TableCell>
                </TableRow>
              ) : rows.length ? (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="px-4 py-3 first:pl-6 last:pr-6"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-gray-500"
                  >
                    No bookings found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {!loading && !error && filteredData.length > 0 && (
          <div className="flex items-center justify-between rounded-xl bg-white border border-gray-200 mt-4 px-4 py-3">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {Math.max(1, pageCount)}
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!canGoPrevious}
                className="cursor-pointer"
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!canGoNext}
                className="cursor-pointer"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <BookingDetailsModal
        bookingId={viewBookingId}
        onClose={() => setViewBookingId(null)}
      />
    </div>
  );
}

