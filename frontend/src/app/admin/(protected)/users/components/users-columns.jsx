"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";

import UserRowActions from "./user-row-actions";
import { formatDate, getFullName } from "../lib/user-formatters";

function getPlanClass(plan) {
  const normalizedPlan = (plan || "Basic").toLowerCase();
  if (normalizedPlan === "pro") return "bg-indigo-100 text-indigo-700";
  if (normalizedPlan === "plus") return "bg-purple-100 text-purple-700";
  return "bg-gray-100 text-gray-700";
}

export function getUsersColumns({ onToggleStatus, onDelete, actionLoadingId }) {
  return [
    {
      id: "fullName",
      header: "Name",
      accessorFn: (row) => getFullName(row),
      cell: ({ row }) => (
        <Link
          href={`/admin/users/${row.original?._id}`}
          className="font-semibold text-indigo-700 hover:text-indigo-800 hover:underline"
        >
          {getFullName(row.original)}
        </Link>
      ),
    },
    {
      id: "email",
      header: "Email",
      accessorKey: "email",
      cell: ({ row }) => (
        <span className="text-muted-foreground">{row.original?.email || "-"}</span>
      ),
    },
    {
      id: "plan",
      header: "Plan",
      accessorKey: "plan",
      cell: ({ row }) => {
        const plan = row.original?.plan || "Basic";
        return <Badge className={getPlanClass(plan)}>{String(plan)}</Badge>;
      },
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "isActive",
      enableSorting: false,
      cell: ({ row }) => {
        const isActive = Boolean(row.original?.isActive);
        return (
          <Badge className={isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
            {isActive ? "Active" : "Suspended"}
          </Badge>
        );
      },
    },
    {
      id: "joined",
      header: "Joined",
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
        const userId = row.original?._id;
        return (
          <UserRowActions
            userId={userId}
            isActive={Boolean(row.original?.isActive)}
            isActionLoading={actionLoadingId === userId}
            onToggleStatus={onToggleStatus}
            onDelete={onDelete}
          />
        );
      },
    },
  ];
}
