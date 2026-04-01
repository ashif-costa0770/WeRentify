"use client";

import Link from "next/link";
import { Loader2, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function BlogsRowActions({
  blog,
  deletingId,
  togglingId,
  onDelete,
  onToggleStatus,
}) {
  if (!blog?._id) return null;

  const isDeleting = deletingId === blog._id;
  const isToggling = togglingId === blog._id;
  const isBusy = isDeleting || isToggling;
  const isPublished = String(blog?.status || "").toLowerCase() === "published";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="cursor-pointer"
          aria-label="Open actions menu"
          disabled={isBusy}
        >
          {isBusy ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <MoreHorizontal className="size-4" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href={`/admin/blogs/edit/${blog._id}`}>Edit</Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onToggleStatus?.(blog._id)}
          disabled={isBusy}
          className="cursor-pointer"
        >
          {isToggling
            ? "Updating status..."
            : isPublished
              ? "Move to draft"
              : "Publish"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete?.(blog._id)}
          disabled={isBusy}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          {isDeleting ? "Deleting..." : "Delete"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
