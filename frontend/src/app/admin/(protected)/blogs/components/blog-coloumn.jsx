"use client";

import { Badge } from "@/components/ui/badge";

import BlogsRowActions from "./blogs-row-actions";

function formatDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toISOString().slice(0, 10);
}

function getStatusClasses(status) {
  const value = String(status || "").toLowerCase();
  if (value === "published") return "bg-emerald-100 text-emerald-700";
  if (value === "draft") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

export function getBlogColumns({ deletingId, togglingId, onDelete, onToggleStatus } = {}) {
  return [
    {
      id: "title",
      header: "Title",
      accessorKey: "title",
      cell: ({ row }) => (
        <span className="block max-w-[20rem] whitespace-normal break-words text-sm font-medium text-slate-800">
          {row.original?.title || "-"}
        </span>
      ),
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => {
        const status = row.original?.status || "-";
        return (
          <Badge className={`capitalize ${getStatusClasses(status)}`}>
            {status}
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
        <BlogsRowActions
          blog={row.original}
          deletingId={deletingId}
          togglingId={togglingId}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ),
    },
  ];
}
