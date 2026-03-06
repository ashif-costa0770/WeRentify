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

export default function ServiceRowActions({
  serviceId,
  isActive,
  actionLoadingId,
  onToggleStatus,
  onDelete,
}) {
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
          <Link href={`/admin/services/${serviceId}`}>View</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onToggleStatus(serviceId, isActive)}
          disabled={actionLoadingId === serviceId}
          className={isActive ? "text-red-600" : "text-green-600"}
        >
          {actionLoadingId === serviceId ? "Updating..." : isActive ? "Deactivate" : "Activate"}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onDelete(serviceId)}
          disabled={actionLoadingId === serviceId}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          {actionLoadingId === serviceId ? "Deleting..." : "Delete"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
