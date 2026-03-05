"use client";

import { useMemo, useState } from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, ChevronUp } from "lucide-react";

import { Badge } from "@/components/ui/badge";
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

function getTypeBadgeClass(type) {
  const value = String(type || "").toLowerCase();
  if (value === "listing") return "bg-blue-100 text-blue-700";
  if (value === "service") return "bg-teal-100 text-teal-700";
  if (value === "post") return "bg-violet-100 text-violet-700";
  return "bg-slate-100 text-slate-700";
}

function getStatusBadgeClass(status) {
  const value = String(status || "").toLowerCase();
  if (value === "active" || value === "published") return "bg-emerald-100 text-emerald-700";
  if (value === "inactive" || value === "suspended") return "bg-rose-100 text-rose-700";
  if (value === "under_maintenance") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

export default function RecentContentTable({ rows, formatDate }) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);

  const columns = useMemo(
    () => [
      {
        id: "title",
        header: "Title",
        accessorKey: "title",
        cell: ({ row }) => (
          <span className="text-sm font-semibold text-slate-700">{row.original?.title || "-"}</span>
        ),
      },
      {
        id: "type",
        header: "Type",
        accessorKey: "type",
        cell: ({ row }) => (
          <Badge className={getTypeBadgeClass(row.original?.type)}>
            {row.original?.type || "-"}
          </Badge>
        ),
      },
      {
        id: "status",
        header: "Status",
        accessorKey: "status",
        cell: ({ row }) => (
          <Badge className={getStatusBadgeClass(row.original?.status)}>
            {row.original?.status || "-"}
          </Badge>
        ),
      },
      {
        id: "date",
        header: "Date",
        accessorKey: "createdAt",
        cell: ({ row }) => (
          <span className="text-sm text-slate-500">{formatDate(row.original?.createdAt)}</span>
        ),
      },
    ],
    [formatDate]
  );

  const table = useReactTable({
    data: Array.isArray(rows) ? rows : [],
    columns,
    state: { globalFilter, sorting },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className="bg-white rounded-xl shadow-md p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-slate-800">Recent Content</h2>
        <Input
          placeholder="Search recent content..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="w-full max-w-xs border-slate-300 bg-white text-slate-800 placeholder:text-slate-500 shadow-sm focus-visible:border-indigo-400 focus-visible:ring-indigo-200"
        />
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="px-4 py-3">
                    {header.isPlaceholder ? null : header.column.getCanSort() ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={header.column.getToggleSortingHandler()}
                        className="-ml-2 h-8 px-2 cursor-pointer"
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === "asc" ? (
                          <ChevronUp className="size-4" />
                        ) : header.column.getIsSorted() === "desc" ? (
                          <ChevronDown className="size-4" />
                        ) : (
                          <ArrowUpDown className="size-4 opacity-50" />
                        )}
                      </Button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-20 text-center text-sm text-slate-500">
                  No recent activity
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
