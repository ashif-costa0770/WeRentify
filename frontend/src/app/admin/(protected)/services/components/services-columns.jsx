"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";

import ServiceRowActions from "./service-row-actions";
import { formatDate, formatHourlyUsd } from "../lib/service-formatters";

function formatStatusLabel(status) {
  return String(status || "inactive")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStatusClass(status) {
  const value = String(status || "").toLowerCase();
  if (value === "active") return "bg-green-100 text-green-700";
  if (value === "pending_verification") return "bg-amber-100 text-amber-700";
  if (value === "under_maintenance") return "bg-indigo-100 text-indigo-700";
  return "bg-slate-100 text-slate-700";
}

export function getServicesColumns({
  actionLoadingId,
  onDelete,
  onToggleStatus,
  onToggleFeatured,
}) {
  return [
    {
      id: "service",
      header: "Service",
      accessorKey: "businessName",
      cell: ({ row }) => (
        <div className="leading-tight">
          <Link
            href={`/admin/services/${row.original?._id}`}
            className="text-sm font-medium text-indigo-700 hover:text-indigo-800 hover:underline"
          >
            {row.original?.businessName || "-"}
          </Link>

        </div>
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
      id: "price",
      header: () => <div className="text-center">Price</div>,
      accessorKey: "hourlyRate",
      cell: ({ row }) => (
        <span className="block text-center text-sm font-medium text-slate-800">
          {formatHourlyUsd(row.original?.hourlyRate)}
        </span>
      ),
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
        const serviceId = row.original?._id;
        const isFeatured = Boolean(row.original?.isFeatured);
        const isLoading = actionLoadingId === serviceId;
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
              onClick={() => onToggleFeatured(serviceId, isFeatured)}
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
        return <Badge className={getStatusClass(status)}>{formatStatusLabel(status)}</Badge>;
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
        const serviceId = row.original?._id;
        const status = String(row.original?.status || "").toLowerCase();
        const isActive = status === "active";
        return (
          <ServiceRowActions
            serviceId={serviceId}
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
