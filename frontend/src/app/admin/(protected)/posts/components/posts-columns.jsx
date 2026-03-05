"use client";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";

import PostRowActions from "./post-row-actions";
import { formatDate } from "../lib/post-formatters";

function getTypeClass(type) {
  const value = String(type || "").toLowerCase();
  if (value === "service") return "bg-teal-100 text-teal-700";
  if (value === "item") return "bg-blue-100 text-blue-700";
  return "bg-slate-100 text-slate-700";
}

function keepFirstTwoWordsTogether(title) {
  const text = String(title || "").trim();
  if (!text) return "-";

  const words = text.split(/\s+/);
  if (words.length < 2) return text;

  return `${words[0]}\u00A0${words.slice(1).join(" ")}`;
}

export function getPostsColumns({ deletingId, onDelete }) {
  return [
    {
      id: "post",
      header: "Post",
      accessorKey: "title",
      cell: ({ row }) => (
        <Link
          href={`/admin/posts/${row.original?._id}`}
          className="block max-w-[22rem] whitespace-normal break-words text-sm font-medium text-indigo-700 hover:text-indigo-800 hover:underline"
        >
          {keepFirstTwoWordsTogether(row.original?.title)}
        </Link>
      ),
    },
    {
      id: "author",
      header: "Author",
      accessorFn: (row) => row?.author?.fullName || "",
      cell: ({ row }) => (
        <Link
          href={`/admin/users/${row.original?.author?._id}`}
          className="text-sm font-medium text-indigo-700 hover:text-indigo-800 hover:underline"
        >
          {row.original?.author?.fullName || "-"}
        </Link>
      ),
    },
    {
      id: "type",
      header: "Type",
      accessorKey: "type",
      cell: ({ row }) => (
        <Badge className={getTypeClass(row.original?.type)}>
          {String(row.original?.type || "-").charAt(0).toUpperCase() + String(row.original?.type || "-").slice(1)}
        </Badge>
      ),
    },
    {
      id: "category",
      header: "Category",
      accessorKey: "category",
      cell: ({ row }) => (
        <span className="text-xs font-semibold text-slate-700">
          {String(row.original?.category || "-").toUpperCase()}
        </span>
      ),
    },
    {
      id: "budget",
      header: "Budget",
      accessorKey: "budget",
      cell: ({ row }) => (
        <span className="text-sm font-medium text-slate-700">{row.original?.budget || "-"}</span>
      ),
    },
    {
      id: "location",
      header: "Location",
      accessorKey: "location",
      cell: ({ row }) => (
        <span className="text-sm text-slate-700">{row.original?.location || "-"}</span>
      ),
    },
    {
      id: "likes",
      header: () => <div className="text-center">Likes</div>,
      accessorKey: "likesCount",
      cell: ({ row }) => (
        <span className="block text-center text-sm font-semibold text-slate-700">
          {row.original?.likesCount ?? 0}
        </span>
      ),
    },
    {
      id: "comments",
      header: () => <div className="text-center">Comments</div>,
      accessorKey: "commentsCount",
      cell: ({ row }) => (
        <span className="block text-center text-sm font-semibold text-slate-700">
          {row.original?.commentsCount ?? 0}
        </span>
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
        const postId = row.original?._id;
        return (
          <PostRowActions
            postId={postId}
            isDeleting={deletingId === postId}
            onDelete={onDelete}
          />
        );
      },
    },
  ];
}
