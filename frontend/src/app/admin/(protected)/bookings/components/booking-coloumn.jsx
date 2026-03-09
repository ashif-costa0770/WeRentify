"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import BookingsRowActions from "./bookings-row-actions";

function getBookingTypeLabel(row) {
  const raw =
    row?.bookingType ??
    (row?.resourceModel && String(row.resourceModel).toLowerCase());
  if (!raw) return "-";
  const t = String(raw).toLowerCase();
  if (t === "service") return "Service";
  if (t === "listing") return "Listing";
  return raw;
}

function getResourceTitle(row) {
  const r = row?.resource;
  if (!r) return "-";
  return r.itemName || r.businessName || r.title || "-";
}

function getUserName(user) {
  if (!user) return "-";
  const first = user.firstname || "";
  const last = user.lastname || "";
  const full = `${first} ${last}`.trim();
  return full || user.email || "-";
}

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toISOString().slice(0, 10);
}

function getBookingStatusClasses(status) {
  const value = String(status || "").toLowerCase();
  if (["confirmed", "completed"].includes(value)) {
    return "bg-emerald-100 text-emerald-700";
  }
  if (["pending", "accepted"].includes(value)) {
    return "bg-amber-100 text-amber-700";
  }
  if (["cancelled", "rejected"].includes(value)) {
    return "bg-rose-100 text-rose-700";
  }
  return "bg-slate-100 text-slate-700";
}

function getPaymentStatusClasses(status) {
  const value = String(status || "").toLowerCase();
  if (value === "paid") {
    return "bg-emerald-100 text-emerald-700";
  }
  if (["pending", "authorized"].includes(value)) {
    return "bg-amber-100 text-amber-700";
  }
  if (["failed", "refunded", "partially_refunded"].includes(value)) {
    return "bg-rose-100 text-rose-700";
  }
  return "bg-slate-100 text-slate-700";
}

export function getBookingColumns({ onConfirm, onCancel, actionLoadingId } = {}) {
  return [
    {
      id: "title",
      header: "Title",
      accessorFn: (row) => getResourceTitle(row),
      cell: ({ row }) => (
        <Link
          href={`/admin/bookings/${row.original?._id}`}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
        >
          {getResourceTitle(row.original)}
        </Link>
      ),
    },
    {
      id: "type",
      header: "Type",
      accessorKey: "bookingType",
      cell: ({ row }) => (
        <span className="text-sm capitalize text-slate-800">
          {getBookingTypeLabel(row.original)}
        </span>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      accessorFn: (row) => getUserName(row.customer),
      cell: ({ row }) => (
        <span className="text-sm text-slate-800">
          {getUserName(row.original?.customer)}
        </span>
      ),
    },
    {
      id: "provider",
      header: "Provider",
      accessorFn: (row) => getUserName(row.provider),
      cell: ({ row }) => (
        <span className="text-sm text-slate-800">
          {getUserName(row.original?.provider)}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const value = row.original?.status || "-";
        return (
          <Badge className={`capitalize ${getBookingStatusClasses(value)}`}>
            {value}
          </Badge>
        );
      },
    },
    {
      id: "paymentStatus",
      header: "Payment",
      accessorKey: "paymentStatus",
      cell: ({ row }) => {
        const value = row.original?.paymentStatus || "-";
        return (
          <Badge className={`capitalize ${getPaymentStatusClasses(value)}`}>
            {value}
          </Badge>
        );
      },
    },
    {
      id: "createdAt",
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
      cell: ({ row }) => (
        <BookingsRowActions
          booking={row.original}
          onConfirm={onConfirm}
          onCancel={onCancel}
          actionLoadingId={actionLoadingId}
        />
      ),
    },
  ];
}