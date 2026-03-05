"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import PlansTable from "./components/plans-table";
import { getPlansColumns } from "./components/plans-columns";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "/backend-api").replace(
  /\/+$/,
  ""
);

export default function PlansPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([]);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    async function fetchPlans() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          page: "1",
          limit: "100",
          search,
        });
        const res = await fetch(`${API_URL}/admin/plans?${params.toString()}`, {
          credentials: "include",
          cache: "no-store",
        });
        const payload = await res.json().catch(() => null);

        if (!res.ok || !payload?.success) {
          throw new Error(payload?.message || "Failed to fetch plans");
        }

        if (cancelled) return;
        setPlans(Array.isArray(payload?.data?.plans) ? payload.data.plans : []);
      } catch (fetchError) {
        if (!cancelled) {
          setPlans([]);
          setError(fetchError.message || "Failed to fetch plans");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPlans();
    return () => {
      cancelled = true;
    };
  }, [search]);

  const handleTogglePlanActive = async (planId, isCurrentlyActive) => {
    const currentPlan = plans.find((plan) => plan?._id === planId);
    if (!currentPlan) return;

    setError("");
    setUpdatingId(planId);

    setPlans((prev) =>
      prev.map((plan) =>
        plan?._id === planId ? { ...plan, isActive: !isCurrentlyActive } : plan
      )
    );

    try {
      const endpoint = isCurrentlyActive ? "deactivate" : "activate";
      const res = await fetch(`${API_URL}/admin/plans/${planId}/${endpoint}`, {
        method: "PATCH",
        credentials: "include",
        cache: "no-store",
      });
      const payload = await res.json().catch(() => null);

      if (!res.ok || !payload?.success) {
        throw new Error(payload?.message || "Failed to update plan status");
      }
      toast.success(isCurrentlyActive ? "Plan deactivated successfully." : "Plan activated successfully.");
    } catch (actionError) {
      setPlans((prev) =>
        prev.map((plan) =>
          plan?._id === planId ? { ...plan, isActive: isCurrentlyActive } : plan
        )
      );
      setError(actionError.message || "Failed to update plan status");
      toast.error(actionError.message || "Failed to update plan status");
    } finally {
      setUpdatingId(null);
    }
  };

  const columns = getPlansColumns({
    updatingId,
    onToggleActive: handleTogglePlanActive,
  });

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Plans</h1>
          <p className="mt-1 text-sm text-slate-500">Manage subscription plans</p>
        </div>
        <Button asChild className="cursor-pointer">
          <Link href="/admin/plans/new">Add Plan</Link>
        </Button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <PlansTable
        columns={columns}
        data={plans}
        loading={loading}
        sorting={sorting}
        onSortingChange={setSorting}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
      />
    </section>
  );
}
