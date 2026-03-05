"use client";

import { Badge } from "@/components/ui/badge";

import PlanRowActions from "./plan-row-actions";
import { formatCurrency, formatDate } from "../lib/plan-formatters";

export function getPlansColumns({ updatingId, onToggleActive }) {
  return [
    {
      id: "name",
      header: "Plan",
      accessorKey: "name",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-slate-900">{row.original?.name || "-"}</span>
      ),
    },
    {
      id: "price",
      header: "Price",
      accessorKey: "price",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-slate-800">
          {formatCurrency(row.original?.price, row.original?.currency)}
        </span>
      ),
    },
    {
      id: "currency",
      header: "Currency",
      accessorKey: "currency",
      cell: ({ row }) => (
        <span className="text-xs font-semibold uppercase text-slate-700">
          {row.original?.currency || "-"}
        </span>
      ),
    },
    {
      id: "platformFeePercent",
      header: "Platform Fee",
      accessorKey: "platformFeePercent",
      cell: ({ row }) => (
        <span className="text-sm text-slate-700">{row.original?.platformFeePercent ?? 0}%</span>
      ),
    },
    {
      id: "popular",
      header: "Popular",
      accessorKey: "popular",
      cell: ({ row }) => (
        <Badge className={row.original?.popular ? "bg-violet-100 text-violet-700" : "bg-slate-100 text-slate-700"}>
          {row.original?.popular ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "isActive",
      cell: ({ row }) => (
        <Badge className={row.original?.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
          {row.original?.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
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
        const planId = row.original?._id;
        return (
          <PlanRowActions
            planId={planId}
            isActive={Boolean(row.original?.isActive)}
            isUpdating={updatingId === planId}
            onToggleActive={onToggleActive}
          />
        );
      },
    },
  ];
}
