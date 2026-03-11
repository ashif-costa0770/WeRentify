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
  ""
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

function formatHourlyUsd(amount) {
  const raw = String(amount ?? "").trim();
  if (!raw) return "-";
  const parsed = Number(raw.replace(/[^\d.-]/g, ""));
  if (!Number.isFinite(parsed)) return raw;
  return `${new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(parsed)}/hr`;
}

function formatStatusLabel(status) {
  return String(status || "inactive")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getStatusClass(status) {
  const value = String(status || "").toLowerCase();
  if (value === "active") return "bg-green-100 text-green-700";
  if (value === "pending_verification") return "bg-amber-100 text-amber-700";
  if (value === "under_maintenance") return "bg-indigo-100 text-indigo-700";
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

export default function ServiceDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const serviceId = params?.id;

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [service, setService] = useState(null);

  useEffect(() => {
    if (!serviceId) return;

    let cancelled = false;

    async function fetchServiceDetails() {
      setLoading(true);
      setError("");
      setNotFound(false);

      try {
        const res = await fetch(`${API_URL}/admin/services/${serviceId}`, {
          credentials: "include",
          cache: "no-store",
        });
        const payload = await res.json().catch(() => null);

        if (!res.ok || !payload?.success || !payload?.data) {
          if (!cancelled) {
            if (res.status === 404) {
              setNotFound(true);
            } else {
              setError(payload?.message || "Failed to load service details");
            }
          }
          return;
        }

        if (!cancelled) {
          setService(payload.data);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError?.message || "Failed to load service details");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchServiceDetails();
    return () => {
      cancelled = true;
    };
  }, [serviceId]);

  const summaryCards = useMemo(
    () => [
      { label: "Views", value: service?.views ?? 0 },
      { label: "Bookings", value: service?.bookings ?? 0 },
      { label: "Rating", value: `${Number(service?.rating ?? 0).toFixed(1)} / 5` },
      { label: "Reviews", value: service?.reviewCount ?? 0 },
    ],
    [service]
  );

  const normalizedDescription = sanitizeHtmlText(service?.description);
  const normalizedCertifications = sanitizeHtmlText(service?.certifications);

  const handleDeleteService = async () => {
    if (!serviceId) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete this service? This action cannot be undone."
    );
    if (!confirmed) return;

    setActionLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/admin/services/${serviceId}`, {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
      });
      const payload = await res.json().catch(() => null);

      if (!res.ok || !payload?.success) {
        throw new Error(payload?.message || "Failed to delete service");
      }

      toast.success("Service deleted successfully.");
      router.replace("/admin/services");
    } catch (deleteError) {
      setError(deleteError?.message || "Failed to delete service");
      toast.error(deleteError?.message || "Failed to delete service");
      setActionLoading(false);
    }
  };
  

  if (loading) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center">
        <p className="text-slate-500">Loading service details...</p>
      </section>
    );
  }

  if (notFound || !service) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center">
        <p className="text-slate-500 text-lg font-medium">Service not found</p>
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
          <h1 className="text-2xl font-semibold text-slate-800">
            {service.businessName || "Service"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">Service ID: {service._id}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge className={getStatusClass(service.status)}>
              {formatStatusLabel(service.status)}
            </Badge>
            <Badge className={service.verified ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}>
              {service.verified ? "Verified" : "Unverified"}
            </Badge>
            {service.isFeatured && (
              <Badge className="flex items-center gap-1 bg-amber-100 text-amber-700 border border-amber-200">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                Featured
              </Badge>
            )}
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/services">Back to Services</Link>
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Basic Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Service Type</p>
            <p className="mt-1 font-medium text-slate-800">{service.serviceType || "-"}</p>
          </div>
          <div>
            <p className="text-slate-500">Category</p>
            <p className="mt-1 text-xs font-semibold text-slate-700">{service.category || "-"}</p>
          </div>
          <div>
            <p className="text-slate-500">Years in Business</p>
            <p className="mt-1 font-medium text-slate-800">{service.yearsInBusiness ?? 0}</p>
          </div>
          <div>
            <p className="text-slate-500">Created</p>
            <p className="mt-1 font-medium text-slate-800">{formatDate(service.createdAt)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Owner Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Owner Name</p>
            <Link
              href={`/admin/users/${service?.owner?._id}`}
              className="mt-1 inline-block font-medium text-indigo-700 hover:text-indigo-800 hover:underline"
            >
              {service?.owner?.fullName || "-"}
            </Link>
          </div>
          <div>
            <p className="text-slate-500">Owner Email</p>
            <p className="mt-1 font-medium text-slate-800">{service?.owner?.email || "-"}</p>
          </div>
          <div>
            <p className="text-slate-500">Account Status</p>
            <p className="mt-1 font-medium text-slate-800">
              {service?.owner?.isActive ? "Active" : "Suspended"}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Joined</p>
            <p className="mt-1 font-medium text-slate-800">{formatDate(service?.owner?.joinedAt)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Contact & Location</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Location</p>
            <p className="mt-1 font-medium text-slate-800">{service.location || "-"}</p>
          </div>
          <div>
            <p className="text-slate-500">Service Radius</p>
            <p className="mt-1 font-medium text-slate-800">{service.serviceRadius ?? 0} km</p>
          </div>
          <div>
            <p className="text-slate-500">Phone</p>
            <p className="mt-1 font-medium text-slate-800">{service.phone || "-"}</p>
          </div>
          <div>
            <p className="text-slate-500">Public Email</p>
            <p className="mt-1 font-medium text-slate-800">{service.email || "-"}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Pricing & Plan</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Hourly Price</p>
            <p className="mt-1 font-medium text-slate-800">{formatHourlyUsd(service.hourlyRate)}</p>
          </div>
          <div>
            <p className="text-slate-500">Plan</p>
            <p className="mt-1 font-medium text-slate-800 capitalize">{service.plan || "-"}</p>
          </div>
          <div>
            <p className="text-slate-500">Website</p>
            {service.website && service.website !== "-" ? (
              <a
                href={service.website}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block font-medium text-indigo-700 hover:text-indigo-800 hover:underline"
              >
                {service.website}
              </a>
            ) : (
              <p className="mt-1 font-medium text-slate-800">-</p>
            )}
          </div>
          <div>
            <p className="text-slate-500">Updated</p>
            <p className="mt-1 font-medium text-slate-800">{formatDate(service.updatedAt)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-md p-6">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">{card.label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Description</h2>
        <p className="text-sm leading-6 text-slate-700 whitespace-pre-wrap">
          {normalizedDescription || "No description available."}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Certifications</h2>
        <p className="text-sm leading-6 text-slate-700 whitespace-pre-wrap">
          {normalizedCertifications && normalizedCertifications !== "-"
            ? normalizedCertifications
            : "No certifications provided."}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Photos</h2>
        {Array.isArray(service.photos) && service.photos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {service.photos.map((photo, idx) => (
              <div key={photo?.public_id || `photo-${idx}`} className="rounded-lg border border-slate-200 overflow-hidden">
                <img
                  src={photo?.url}
                  alt={`Service photo ${idx + 1}`}
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
        {Array.isArray(service.videos) && service.videos.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {service.videos.map((video, idx) => (
              <div key={video?.public_id || `video-${idx}`} className="rounded-lg border border-slate-200 overflow-hidden">
                <video controls className="w-full bg-black">
                  <source src={video?.url} />
                </video>
                <div className="px-3 py-2 text-xs text-slate-600">
                  <p>Format: {video?.format || "-"}</p>
                  <p>
                    Size: {video?.width || "-"} x {video?.height || "-"}
                  </p>
                  <p>Duration: {video?.duration ? `${Math.round(video.duration)}s` : "-"}</p>
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
          Deleting a service removes all associated media and cannot be undone.
        </p>
        <Button
          type="button"
          variant="destructive"
          onClick={handleDeleteService}
          disabled={actionLoading}
          className="mt-4 cursor-pointer"
        >
          {actionLoading ? "Deleting..." : "Delete Service"}
        </Button>
      </div>
    </section>
  );
}
