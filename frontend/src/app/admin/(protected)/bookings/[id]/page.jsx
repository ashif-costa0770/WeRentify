"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

import AdminGuard from "../../AdminGuard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "/backend-api").replace(
  /\/+$/,
  "",
);

function formatDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatShortDate(value) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatCurrency(amount, currency = "USD") {
  const n = Number(amount);
  if (Number.isNaN(n)) return "—";
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n);
}

function getStatusBadgeClass(status) {
  const value = String(status || "").toLowerCase();
  if (["confirmed", "completed", "paid"].includes(value)) {
    return "bg-emerald-100 text-emerald-700";
  }
  if (["pending", "authorized"].includes(value)) {
    return "bg-amber-100 text-amber-700";
  }
  if (["cancelled", "rejected", "failed", "refunded"].includes(value)) {
    return "bg-rose-100 text-rose-700";
  }
  return "bg-slate-100 text-slate-700";
}

function getBookingTypeLabel(booking) {
  const raw =
    booking?.bookingType ??
    (booking?.resourceModel && booking.resourceModel.toLowerCase());
  if (!raw) return "—";
  const t = String(raw).toLowerCase();
  if (t === "service") return "Service";
  if (t === "listing") return "Listing";
  return raw;
}

function getResourceTitle(resource) {
  if (!resource) return "—";
  return resource.itemName || resource.businessName || resource.title || "—";
}

function getUserName(user) {
  if (!user) return "—";
  const first = user.firstname || "";
  const last = user.lastname || "";
  const full = `${first} ${last}`.trim();
  return full || user.email || "—";
}

function canConfirmStatus(status) {
  const value = String(status || "").toLowerCase();
  return ["pending", "accepted"].includes(value);
}

function canCancelStatus(status) {
  const value = String(status || "").toLowerCase();
  return ["pending", "accepted", "confirmed"].includes(value);
}

export default function AdminBookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.id;

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (!bookingId) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `${API_URL}/admin/bookings/${bookingId}`,
          {
            credentials: "include",
            cache: "no-store",
          },
        );
        const payload = await res.json().catch(() => null);
        if (!res.ok || !payload?.success) {
          throw new Error(payload?.message || "Failed to load booking details");
        }
        const data = payload?.data;
        if (!cancelled) {
          setBooking(data || null);
          if (!data) {
            setError("Booking not found");
          }
        }
      } catch (err) {
        if (!cancelled) {
          const msg =
            err?.response?.data?.message || "Failed to load booking details";
          setError(msg);
          toast.error(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  const summary = useMemo(() => {
    if (!booking) return null;
    return {
      id: booking._id,
      type: getBookingTypeLabel(booking),
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      createdAt: booking.createdAt,
    };
  }, [booking]);

  const handleUpdateStatus = async (nextStatus) => {
    if (!booking || !bookingId) return;
    setActionLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/admin/bookings/${bookingId}/status`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ status: nextStatus }),
        },
      );
      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload?.success) {
        throw new Error(payload?.message || "Failed to update booking status");
      }
      setBooking((prev) => (prev ? { ...prev, status: nextStatus } : prev));
      toast.success(
        nextStatus === "cancelled"
          ? "Booking cancelled successfully"
          : "Booking confirmed successfully",
      );
    } catch (err) {
      toast.error(err.message || "Failed to update booking status");
    } finally {
      setActionLoading(false);
    }
  };

  const resourceSection = useMemo(() => {
    if (!booking) return null;
    const date = booking.bookingDate || booking.startDate;
    const address = booking.address || "—";
    return {
      title: getResourceTitle(booking.resource),
      providerName: getUserName(booking.provider),
      bookingDate: date,
      timeSlot: booking.timeSlot || "—",
      quantity: booking.quantity ?? 1,
      address,
    };
  }, [booking]);

  const customerSection = useMemo(() => {
    if (!booking) return null;
    return {
      name: getUserName(booking.customer),
      address: booking.address || "—",
    };
  }, [booking]);

  const priceSection = useMemo(() => {
    if (!booking) return null;
    return {
      unitPrice: booking.unitPrice,
      quantity: booking.quantity ?? 1,
      platformFee: booking.platformFee,
      discountAmount: booking.discountAmount,
      taxAmount: booking.taxAmount,
      totalPrice: booking.totalPrice,
      currency: booking.currency || "USD",
    };
  }, [booking]);

  if (!bookingId) {
    return (
      <AdminGuard>
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-6 text-center">
            <p className="text-sm text-gray-600">Missing booking id in URL.</p>
            <Button
              type="button"
              variant="outline"
              className="mt-4 cursor-pointer"
              onClick={() => router.push("/admin/bookings")}
            >
              Back to Bookings
            </Button>
          </div>
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="min-h-screen bg-gray-100 px-4 py-8">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => router.push("/admin/bookings")}
              className="cursor-pointer"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bookings
            </Button>
            {summary?.id && (
              <p className="text-xs text-gray-500 truncate">
                Booking ID: <span className="font-mono">{summary.id}</span>
              </p>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              </div>
            ) : error ? (
              <div className="space-y-3">
                <p className="text-sm text-red-600">{error}</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push("/admin/bookings")}
                  className="cursor-pointer"
                >
                  Back to Bookings
                </Button>
              </div>
            ) : booking ? (
              <div className="space-y-6">
                {/* Booking Summary */}
                <section className="space-y-2">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    Booking Summary
                  </h1>
                  <p className="text-sm text-gray-500">
                    High-level overview of this booking.
                  </p>

                  <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                      <p className="text-xs font-medium uppercase text-gray-500">
                        Booking Type
                      </p>
                      <p className="mt-1 text-sm font-semibold text-gray-900">
                        {summary?.type}
                      </p>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                      <p className="text-xs font-medium uppercase text-gray-500">
                        Booking Status
                      </p>
                      <div className="mt-1">
                        <Badge
                          className={`capitalize ${getStatusBadgeClass(booking.status)}`}
                        >
                          {booking.status || "—"}
                        </Badge>
                      </div>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                      <p className="text-xs font-medium uppercase text-gray-500">
                        Payment Status
                      </p>
                      <div className="mt-1">
                        <Badge
                          className={`capitalize ${getStatusBadgeClass(
                            booking.paymentStatus,
                          )}`}
                        >
                          {booking.paymentStatus || "—"}
                        </Badge>
                      </div>
                    </div>
                    <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                      <p className="text-xs font-medium uppercase text-gray-500">
                        Created At
                      </p>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatShortDate(summary?.createdAt)}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Resource and Customer */}
                <section className="grid gap-4 lg:grid-cols-2">
                  <div className="rounded-2xl border border-gray-100 bg-white px-5 py-4">
                    <h2 className="text-sm font-semibold text-gray-900">
                      Service / Listing Details
                    </h2>
                    <dl className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Title</dt>
                        <dd className="text-gray-900 text-right">
                          {resourceSection?.title}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Provider</dt>
                        <dd className="text-gray-900 text-right">
                          {resourceSection?.providerName}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Booking Date</dt>
                        <dd className="text-gray-900 text-right">
                          {formatShortDate(resourceSection?.bookingDate)}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Time Slot</dt>
                        <dd className="text-gray-900 text-right">
                          {resourceSection?.timeSlot || "—"}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Quantity</dt>
                        <dd className="text-gray-900 text-right">
                          {resourceSection?.quantity}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Address</dt>
                        <dd className="text-gray-900 text-right max-w-xs">
                          {resourceSection?.address}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <div className="rounded-2xl border border-gray-100 bg-white px-5 py-4">
                    <h2 className="text-sm font-semibold text-gray-900">
                      Customer Details
                    </h2>
                    <dl className="mt-3 space-y-2 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Name</dt>
                        <dd className="text-gray-900 text-right">
                          {customerSection?.name}
                        </dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-gray-500">Address</dt>
                        <dd className="text-gray-900 text-right max-w-xs">
                          {customerSection?.address}
                        </dd>
                      </div>
                      <div className="mt-4 border-t border-gray-100 pt-3">
                        <h3 className="text-xs font-semibold uppercase text-gray-500">
                          Payment Details
                        </h3>
                        <dl className="mt-2 space-y-2 text-sm">
                          <div className="flex justify-between gap-4">
                            <dt className="text-gray-500">Payment Method</dt>
                            <dd className="text-gray-900 text-right">
                              {booking.paymentMethod || "—"}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-4">
                            <dt className="text-gray-500">Provider</dt>
                            <dd className="text-gray-900 text-right">
                              {booking.paymentProvider || "—"}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-4">
                            <dt className="text-gray-500">Payment ID</dt>
                            <dd className="text-gray-900 text-right max-w-xs truncate">
                              {booking.paymentId || "—"}
                            </dd>
                          </div>
                          <div className="flex justify-between gap-4">
                            <dt className="text-gray-500">Currency</dt>
                            <dd className="text-gray-900 text-right">
                              {booking.currency || "USD"}
                            </dd>
                          </div>
                        </dl>
                      </div>
                    </dl>
                  </div>
                </section>

                {/* Price breakdown */}
                <section className="rounded-2xl border border-gray-100 bg-white px-5 py-4">
                  <h2 className="text-sm font-semibold text-gray-900">
                    Price Breakdown
                  </h2>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">Unit Price</dt>
                      <dd className="text-gray-900">
                        {formatCurrency(priceSection.unitPrice, priceSection.currency)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">Quantity</dt>
                      <dd className="text-gray-900">{priceSection.quantity}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">Platform Fee</dt>
                      <dd className="text-gray-900">
                        {formatCurrency(
                          priceSection.platformFee,
                          priceSection.currency,
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">Discount</dt>
                      <dd className="text-gray-900">
                        -
                        {formatCurrency(
                          priceSection.discountAmount,
                          priceSection.currency,
                        )}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">Tax</dt>
                      <dd className="text-gray-900">
                        {formatCurrency(priceSection.taxAmount, priceSection.currency)}
                      </dd>
                    </div>
                    <div className="mt-2 border-t border-gray-100 pt-3 flex justify-between gap-4">
                      <dt className="text-sm font-semibold text-gray-900">
                        Total Price
                      </dt>
                      <dd className="text-sm font-semibold text-gray-900">
                        {formatCurrency(priceSection.totalPrice, priceSection.currency)}
                      </dd>
                    </div>
                  </dl>
                </section>

                {/* Timeline */}
                <section className="rounded-2xl border border-gray-100 bg-white px-5 py-4">
                  <h2 className="text-sm font-semibold text-gray-900">
                    Booking Timeline
                  </h2>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">Created At</dt>
                      <dd className="text-gray-900">
                        {formatDate(booking.createdAt)}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-gray-500">Updated At</dt>
                      <dd className="text-gray-900">
                        {formatDate(booking.updatedAt)}
                      </dd>
                    </div>
                  </dl>
                </section>

                {/* Actions */}
                <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
                  {canCancelStatus(booking.status) && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleUpdateStatus("cancelled")}
                      disabled={actionLoading}
                      className="cursor-pointer text-red-600 border-red-200 hover:bg-red-50 disabled:text-gray-400 disabled:border-gray-200"
                    >
                      {actionLoading ? "Cancelling..." : "Cancel Booking"}
                    </Button>
                  )}
                  {canConfirmStatus(booking.status) && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleUpdateStatus("confirmed")}
                      disabled={actionLoading}
                      className="cursor-pointer text-emerald-600 border-emerald-200 hover:bg-emerald-50 disabled:text-gray-400 disabled:border-gray-200"
                    >
                      {actionLoading ? "Updating..." : "Confirm Booking"}
                    </Button>
                  )}
                </section>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}

