"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "/backend-api").replace(
  /\/+$/,
  "",
);

function formatDate(dateValue) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatUsd(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "-";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(numeric);
}

function formatStatusLabel(status) {
  return String(status || "inactive")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStatusClass(status) {
  const value = String(status || "").toLowerCase();
  if (value === "active") return "bg-green-100 text-green-700";
  if (value === "rented") return "bg-indigo-100 text-indigo-700";
  if (value === "under_maintenance") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

function sanitizeHtmlText(value) {
  if (!value) return "";
  return String(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function ListingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [listing, setListing] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!listingId) return;

    let cancelled = false;

    async function fetchListingDetails() {
      setLoading(true);
      setError("");
      setNotFound(false);

      try {
        const res = await fetch(`${API_URL}/admin/listings/${listingId}`, {
          credentials: "include",
          cache: "no-store",
        });
        const payload = await res.json().catch(() => null);

        if (!res.ok || !payload?.success || !payload?.data) {
          if (!cancelled) {
            if (res.status === 404) {
              setNotFound(true);
            } else {
              setError(payload?.message || "Failed to load listing details");
            }
          }
          return;
        }

        if (!cancelled) {
          setListing(payload.data);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError?.message || "Failed to load listing details");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchListingDetails();
    return () => {
      cancelled = true;
    };
  }, [listingId]);

  const summaryCards = useMemo(
    () => [
      { label: "Views", value: listing?.views ?? 0 },
      { label: "Bookings", value: listing?.bookings ?? 0 },
      {
        label: "Rating",
        value: `${Number(listing?.rating ?? 0).toFixed(1)} / 5`,
      },
      { label: "Reviews", value: listing?.reviewCount ?? 0 },
    ],
    [listing],
  );

  const normalizedDescription = sanitizeHtmlText(listing?.description);
  const normalizedPolicy = sanitizeHtmlText(listing?.cancellationPolicy);

  const handleDeleteListing = async () => {
    if (!listingId) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete this listing? This action cannot be undone.",
    );
    if (!confirmed) return;

    setActionLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/admin/listings/${listingId}`, {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
      });
      const payload = await res.json().catch(() => null);

      if (!res.ok || !payload?.success) {
        throw new Error(payload?.message || "Failed to delete listing");
      }

      toast.success("Listing deleted successfully.");
      router.replace("/admin/listings");
    } catch (deleteError) {
      setError(deleteError?.message || "Failed to delete listing");
      toast.error(deleteError?.message || "Failed to delete listing");
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center">
        <p className="text-slate-500">Loading listing details...</p>
      </section>
    );
  }

  if (notFound || !listing) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center">
        <p className="text-slate-500 text-lg font-medium">Listing not found</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            {listing.itemName || "Listing"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Listing ID: {listing._id}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge className={getStatusClass(listing.status)}>
              {formatStatusLabel(listing.status)}
            </Badge>
            <Badge
              className={
                listing.isAvailable
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-red-100 text-red-700"
              }
            >
              {listing.isAvailable ? "Available" : "Unavailable"}
            </Badge>
            {listing.isFeatured && (
              <Badge className="flex items-center gap-1 bg-amber-100 text-amber-700 border border-amber-200">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                Featured
              </Badge>
            )}
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/listings">Back to Listings</Link>
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Basic Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Category</p>
            <p className="mt-1 text-xs font-semibold text-slate-700">
              {listing.category || "-"}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Pickup Location</p>
            <p className="mt-1 font-medium text-slate-800">
              {listing.pickupLocation || "-"}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Created</p>
            <p className="mt-1 font-medium text-slate-800">
              {formatDate(listing.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Updated</p>
            <p className="mt-1 font-medium text-slate-800">
              {formatDate(listing.updatedAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Owner Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Owner Name</p>
            <Link
              href={`/admin/users/${listing?.owner?._id}`}
              className="mt-1 inline-block font-medium text-indigo-700 hover:text-indigo-800 hover:underline"
            >
              {listing?.owner?.fullName || "-"}
            </Link>
          </div>
          <div>
            <p className="text-slate-500">Email</p>
            <p className="mt-1 font-medium text-slate-800">
              {listing?.owner?.email || "-"}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Account Status</p>
            <p className="mt-1 font-medium text-slate-800">
              {listing?.owner?.isActive ? "Active" : "Suspended"}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Joined</p>
            <p className="mt-1 font-medium text-slate-800">
              {formatDate(listing?.owner?.joinedAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Pricing & Delivery
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Hourly Price</p>
            <p className="mt-1 font-medium text-slate-800">
              {listing.hourlyRate == null
                ? "-"
                : `${formatUsd(listing.hourlyRate)}/hour`}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Daily Price</p>
            <p className="mt-1 font-medium text-slate-800">
              {listing.dailyRate == null
                ? "-"
                : `${formatUsd(listing.dailyRate)}/day`}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Weekly Price</p>
            <p className="mt-1 font-medium text-slate-800">
              {listing.weeklyRate == null
                ? "-"
                : `${formatUsd(listing.weeklyRate)}/week`}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Delivery</p>
            <p className="mt-1 font-medium text-slate-800">
              {listing.offerDelivery
                ? listing.deliveryFee == null
                  ? "Offered"
                  : `${formatUsd(listing.deliveryFee)} fee`
                : "Not Offered"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-md p-6">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">
              {card.label}
            </p>
            <p className="text-3xl font-bold text-slate-900 mt-2">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">
          Description
        </h2>
        <p className="text-sm leading-6 text-slate-700 whitespace-pre-wrap">
          {normalizedDescription || "No description available."}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            Features
          </h2>
          {Array.isArray(listing.features) && listing.features.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
              {listing.features.map((feature, idx) => (
                <li key={`${feature}-${idx}`}>{feature}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No features listed.</p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-3">
            Rental Rules
          </h2>
          {Array.isArray(listing.rentalRules) &&
          listing.rentalRules.length > 0 ? (
            <ul className="list-disc pl-5 space-y-1 text-sm text-slate-700">
              {listing.rentalRules.map((rule, idx) => (
                <li key={`${rule}-${idx}`}>{rule}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">No rental rules provided.</p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Policy & Media
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-sm">
          <div className="lg:col-span-2">
            <p className="text-slate-500">Cancellation Policy</p>
            <p className="mt-1 text-slate-800">
              {normalizedPolicy && normalizedPolicy !== "-"
                ? normalizedPolicy
                : "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Media Summary</p>
            <p className="mt-1 text-slate-800">
              Photos: {listing.photos?.length || 0}
            </p>
            <p className="text-slate-800">
              Videos: {listing.videos?.length || 0}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Photos</h2>
        {Array.isArray(listing.photos) && listing.photos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listing.photos.map((photo, idx) => (
              <div
                key={photo?.public_id || `photo-${idx}`}
                className="rounded-lg border border-slate-200 overflow-hidden"
              >
                <img
                  src={photo?.url}
                  alt={`Listing photo ${idx + 1}`}
                  className="h-48 w-full object-cover bg-slate-100"
                />
                <div className="px-3 py-2 text-xs text-slate-600">
                  <p>Format: {photo?.format || "-"}</p>
                  <p>
                    Size: {photo?.width || "-"} x {photo?.height || "-"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No photos available.</p>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Videos</h2>
        {Array.isArray(listing.videos) && listing.videos.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {listing.videos.map((video, idx) => (
              <div
                key={video?.public_id || `video-${idx}`}
                className="rounded-lg border border-slate-200 overflow-hidden"
              >
                <video controls className="w-full bg-black">
                  <source src={video?.url} />
                </video>
                <div className="px-3 py-2 text-xs text-slate-600">
                  <p>Format: {video?.format || "-"}</p>
                  <p>
                    Size: {video?.width || "-"} x {video?.height || "-"}
                  </p>
                  <p>
                    Duration:{" "}
                    {video?.duration ? `${Math.round(video.duration)}s` : "-"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No videos available.</p>
        )}
      </div>

      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-red-700">Danger Zone</h2>
        <p className="mt-1 text-sm text-red-700/80">
          Deleting a listing will remove all associated media and cannot be
          undone.
        </p>
        <Button
          type="button"
          variant="destructive"
          onClick={handleDeleteListing}
          disabled={actionLoading}
          className="mt-4 cursor-pointer"
        >
          {actionLoading ? "Deleting..." : "Delete Listing"}
        </Button>
      </div>
    </section>
  );
}
