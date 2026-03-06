"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function ListingRowActions({ listingId, onDelete, onToggleStatus, actionLoadingId, isActive }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="cursor-pointer"
          aria-label="Open actions menu"
        >
          <MoreHorizontal />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link href={`/admin/listings/${listingId}`}>View</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onToggleStatus(listingId, isActive)}
          disabled={actionLoadingId === listingId}
          className={isActive ? "text-red-600" : "text-green-600"}
        >
          {actionLoadingId === listingId ? "Updating..." : isActive ? "Deactivate" : "Activate"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete(listingId)}
          disabled={actionLoadingId === listingId}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          {actionLoadingId === listingId ? "Deleting..." : "Delete"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
