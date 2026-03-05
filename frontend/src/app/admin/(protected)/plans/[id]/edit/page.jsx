"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "/backend-api").replace(
  /\/+$/,
  ""
);

export default function EditPlanPage() {
  const params = useParams();
  const router = useRouter();
  const planId = params?.id;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("usd");
  const [platformFeePercent, setPlatformFeePercent] = useState("");
  const [featuresInput, setFeaturesInput] = useState("");
  const [popular, setPopular] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!planId) return;

    let cancelled = false;

    async function fetchPlanDetails() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(`${API_URL}/admin/plans/${planId}`, {
          credentials: "include",
          cache: "no-store",
        });
        const payload = await res.json().catch(() => null);

        if (!res.ok || !payload?.success || !payload?.data) {
          throw new Error(payload?.message || "Failed to load plan details");
        }

        if (cancelled) return;
        const plan = payload.data;
        setName(plan?.name || "");
        setPrice(plan?.price != null ? String(plan.price) : "");
        setCurrency(plan?.currency || "usd");
        setPlatformFeePercent(
          plan?.platformFeePercent != null ? String(plan.platformFeePercent) : ""
        );
        setFeaturesInput(
          Array.isArray(plan?.features) ? plan.features.join(", ") : ""
        );
        setPopular(Boolean(plan?.popular));
        setIsActive(Boolean(plan?.isActive));
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError?.message || "Failed to load plan details");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPlanDetails();
    return () => {
      cancelled = true;
    };
  }, [planId]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    const features = featuresInput
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);

    if (features.length === 0) {
      setError("Please add at least one feature.");
      toast.error("Please add at least one feature.");
      setSubmitting(false);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/admin/plans/${planId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          price: Number(price),
          currency,
          platformFeePercent: Number(platformFeePercent),
          features,
          popular,
          isActive,
        }),
      });

      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload?.success) {
        throw new Error(payload?.message || "Failed to update plan");
      }

      toast.success("Plan updated successfully.");
      router.replace("/admin/plans");
    } catch (submitError) {
      setError(submitError?.message || "Failed to update plan");
      toast.error(submitError?.message || "Failed to update plan");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center">
        <p className="text-slate-500">Loading plan details...</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Edit Plan</h1>
          <p className="mt-1 text-sm text-slate-500">Plan ID: {planId}</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/plans">Back to Plans</Link>
        </Button>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-6 shadow-sm space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Plan Name</label>
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Pro"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Price</label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="49"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Currency</label>
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            >
              <option value="usd">USD</option>
              <option value="inr">INR</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Platform Fee (%)</label>
            <Input
              type="number"
              min="0"
              step="0.1"
              value={platformFeePercent}
              onChange={(event) => setPlatformFeePercent(event.target.value)}
              placeholder="3"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700">Features (comma-separated)</label>
          <textarea
            value={featuresInput}
            onChange={(event) => setFeaturesInput(event.target.value)}
            placeholder="Priority support, Unlimited listings, Lower platform fee"
            className="min-h-24 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            required
          />
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={popular}
              onChange={(event) => setPopular(event.target.checked)}
              className="h-4 w-4"
            />
            Popular Plan
          </label>

          <label className="inline-flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
              className="h-4 w-4"
            />
            Active
          </label>
        </div>

        <div className="flex items-center gap-3">
          <Button type="submit" className="cursor-pointer" disabled={submitting}>
            {submitting ? "Updating..." : "Update Plan"}
          </Button>
          <Button asChild type="button" variant="outline">
            <Link href="/admin/plans">Cancel</Link>
          </Button>
        </div>
      </form>
    </section>
  );
}
