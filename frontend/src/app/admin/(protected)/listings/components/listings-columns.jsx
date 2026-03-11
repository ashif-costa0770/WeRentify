"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";

import { formatDate } from "../lib/listing-formatters";
import ListingRowActions from "./listing-row-actions";

function getStatusClass(status) {
  const normalized = (status || "").toLowerCase();
  if (normalized === "active") return "bg-green-100 text-green-700";
  if (normalized === "rented") return "bg-indigo-100 text-indigo-700";
  if (normalized === "under_maintenance") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

function formatStatusLabel(status) {
  return String(status || "inactive")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDailyPriceUsd(amount) {
  const numeric = Number(amount);
  if (!Number.isFinite(numeric)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(numeric);
}

export function getListingsColumns({
  actionLoadingId,
  onDelete,
  onToggleStatus,
  onToggleFeatured,
}) {
  return [
    {
      id: "itemName",
      header: "Listing",
      accessorKey: "itemName",
      cell: ({ row }) => (
        <Link
          href={`/admin/listings/${row.original?._id}`}
          className="text-sm font-medium text-indigo-700 hover:text-indigo-800 hover:underline"
        >
          {row.original?.itemName || "-"}
        </Link>
      ),
    },
    {
      id: "owner",
      header: "Owner",
      accessorFn: (row) => row?.owner?.fullName || "",
      cell: ({ row }) => (
        <Link
          href={`/admin/users/${row.original?.owner?._id}`}
          className="text-sm font-medium text-indigo-700 hover:text-indigo-800 hover:underline"
        >
          {row.original?.owner?.fullName || "-"}
        </Link>
      ),
    },
    {
      id: "price",
      header: () => <div className="text-center">Price</div>,
      accessorKey: "dailyRate",
      cell: ({ row }) => (
        <span className="block text-center text-sm font-medium text-slate-800">
          {formatDailyPriceUsd(row.original?.dailyRate)}/day
        </span>
      ),
    },
    {
      id: "category",
      header: "Category",
      accessorKey: "category",
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-slate-700">
          {row.original?.category || "-"}
        </span>
      ),
    },
    {
      id: "availability",
      header: "Availability",
      accessorKey: "isAvailable",
      cell: ({ row }) => {
        const isAvailable = Boolean(row.original?.isAvailable);
        return (
          <Badge
            className={
              isAvailable
                ? "bg-emerald-100 text-emerald-700"
                : "bg-red-100 text-red-700"
            }
          >
            {isAvailable ? "Available" : "Unavailable"}
          </Badge>
        );
      },
    },
    {
      id: "bookings",
      header: () => <div className="text-center">Bookings</div>,
      accessorKey: "bookings",
      cell: ({ row }) => (
        <span className="block text-center text-sm font-semibold text-slate-700">
          {Number(row.original?.bookings ?? 0)}
        </span>
      ),
    },
    {
      id: "featured",
      header: () => <div className="text-center">Featured</div>,
      accessorKey: "isFeatured",
      cell: ({ row }) => {
        const listingId = row.original?._id;
        const isFeatured = Boolean(row.original?.isFeatured);
        const isLoading = actionLoadingId === listingId;
        return (
          <div className="flex items-center justify-center">
            <button
              type="button"
              role="switch"
              aria-checked={isFeatured}
              aria-label={
                isFeatured ? "Remove from featured" : "Mark as featured"
              }
              disabled={isLoading}
              onClick={() => onToggleFeatured(listingId, isFeatured)}
              className={`relative inline-flex h-4 w-8 flex-shrink-0 cursor-pointer rounded-full border-0
  transition-all duration-300 ease-in-out
  focus:outline-none focus:ring-2 focus:ring-offset-2
  disabled:cursor-not-allowed disabled:opacity-50
  ${
    isFeatured
      ? "bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-400 shadow-[0_0_4px_rgba(16,185,129,0.6)]"
      : "bg-slate-300 hover:bg-slate-400 focus:ring-slate-300 shadow-[0_0_4px_rgba(107,114,128,0.6)]"
  }`}
            >
              <span
                className={`pointer-events-none absolute top-[2px] left-[2px]
    inline-block h-3 w-3 rounded-full bg-white
    shadow transition-transform duration-300 ease-in-out
    ${isFeatured ? "translate-x-[16px]" : "translate-x-0"}`}
              />
            </button>
          </div>
        );
      },
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const status = row.original?.status || "inactive";
        return (
          <Badge className={getStatusClass(status)}>
            {formatStatusLabel(status)}
          </Badge>
        );
      },
    },
    {
      id: "created",
      header: "Created",
      accessorKey: "createdAt",
      cell: ({ row }) => (
        <span className="text-xs font-medium text-slate-500">
          {formatDate(row.original?.createdAt)}
        </span>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      enableSorting: false,
      enableColumnFilter: false,
      enableGlobalFilter: false,
      cell: ({ row }) => {
        const listingId = row.original?._id;
        const status = String(row.original?.status || "").toLowerCase();
        const isActive = status === "active";
        return (
          <ListingRowActions
            listingId={listingId}
            isActive={isActive}
            actionLoadingId={actionLoadingId}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
          />
        );
      },
    },
  ];
}
