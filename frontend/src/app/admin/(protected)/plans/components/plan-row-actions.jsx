"use client";

import Link from "next/link";
import { MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function PlanRowActions({ planId, isActive, isUpdating, onToggleActive }) {
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
          <Link href={`/admin/plans/${planId}/edit`}>Edit</Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onToggleActive(planId, isActive)}
          disabled={isUpdating}
          className={`cursor-pointer ${isActive ? "text-destructive focus:text-destructive" : "text-green-700 focus:text-green-700"}`}
        >
          {isUpdating ? "Updating..." : isActive ? "Deactivate" : "Activate"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
