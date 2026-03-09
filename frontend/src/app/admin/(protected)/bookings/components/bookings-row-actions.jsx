"use client";

import { Loader2, MoreHorizontal } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function canConfirmStatus(status) {
  return ["pending", "accepted"].includes(String(status || "").toLowerCase());
}

function canCancelStatus(status) {
  return ["pending", "accepted", "confirmed"].includes(
    String(status || "").toLowerCase(),
  );
}

export default function BookingsRowActions({
  booking,
  onConfirm,
  onCancel,
  actionLoadingId,
}) {
  if (!booking) return null;

  const status = String(booking.status || "").toLowerCase();
  const canConfirm = canConfirmStatus(status);
  const canCancel = canCancelStatus(status);
  const isLoading = actionLoadingId === booking._id;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="cursor-pointer"
          disabled={isLoading}
          aria-label="Open actions menu"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <MoreHorizontal className="size-4" />
          )}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link
            href={`/admin/bookings/${booking._id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            View
          </Link>
        </DropdownMenuItem>

        {(canConfirm || canCancel) && <DropdownMenuSeparator />}

        {canConfirm && (
          <DropdownMenuItem
            onClick={() => onConfirm?.(booking._id)}
            disabled={isLoading}
            className="cursor-pointer text-emerald-600 focus:text-emerald-600"
          >
            {isLoading ? "Updating..." : "Confirm booking"}
          </DropdownMenuItem>
        )}

        {canCancel && (
          <DropdownMenuItem
            onClick={() => onCancel?.(booking._id)}
            disabled={isLoading}
            className="cursor-pointer text-destructive focus:text-destructive"
          >
            {isLoading ? "Updating..." : "Cancel booking"}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
