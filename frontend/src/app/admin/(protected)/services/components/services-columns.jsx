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

export function getServicesColumns({ actionLoadingId, onDelete, onToggleStatus }) {
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
