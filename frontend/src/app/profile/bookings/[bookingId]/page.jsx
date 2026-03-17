"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Download, Loader2, MessageCircle, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getBookingById, updateBookingStatus } from "@/services/booking.service";
import { toast } from "sonner";

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

function getProviderName(provider) {
  if (!provider) return "—";
  const first = provider.firstname || "";
  const last = provider.lastname || "";
  return `${first} ${last}`.trim() || provider.email || "—";
}

function getCustomerName(customer) {
  if (!customer) return "—";
  const first = customer.firstname || "";
  const last = customer.lastname || "";
  return `${first} ${last}`.trim() || customer.email || "—";
}

const isCancellable = (booking) => {
  const status = String(booking?.status || "").toLowerCase();
  return ["pending", "accepted", "confirmed"].includes(status);
};

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params?.bookingId;

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
        const res = await getBookingById(bookingId);
        const data = res?.data?.data;
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

  const handleCancelBooking = async () => {
    if (!booking || !isCancellable(booking)) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking? This action cannot be undone.",
    );
    if (!confirmed) return;

    try {
      setActionLoading(true);
      const res = await updateBookingStatus(booking._id, {
        status: "cancelled",
        cancelledBy: "customer",
      });
      const updated = res?.data?.data || booking;
      setBooking(updated);
      toast.success("Booking cancelled successfully");
    } catch (err) {
      const msg =
        err?.response?.data?.message || "Failed to cancel booking. Try again.";
      toast.error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleContactProvider = () => {
    router.push("/profile/messages");
  };


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

  const resourceSection = useMemo(() => {
    if (!booking) return null;
    const date = booking.bookingDate || booking.startDate;
    const address = booking.address || "—";
    return {
      title: getResourceTitle(booking.resource),
      providerName: getProviderName(booking.provider),
      bookingDate: date,
      timeSlot: booking.timeSlot || "—",
      quantity: booking.quantity ?? 1,
      address,
    };
  }, [booking]);

  const customerSection = useMemo(() => {
    if (!booking) return null;
    return {
      name: getCustomerName(booking.customer),
    };
  }, [booking]);

  const priceSection = useMemo(() => {
    if (!booking) return null;
    return {
      quantity: booking.quantity ?? 1,
      totalPrice: booking.totalPrice,
      currency: booking.currency || "USD",
    };
  }, [booking]);

  if (!bookingId) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-100/60 p-6 sm:p-8">
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          </div>
        ) : error ? (
          <div className="space-y-3 text-center">
            <p className="text-sm text-red-600">{error}</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/profile/my-bookings")}
              className="cursor-pointer"
            >
              Back to My Bookings
            </Button>
          </div>
        ) : booking ? (
          <div className="space-y-7">
            <section className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1.5">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {summary?.type}
                </p>
                <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
                  {resourceSection?.title}
                </h1>
                <p className="text-sm text-slate-500">
                  Booked for{" "}
                  <span className="font-semibold text-slate-900">
                    {formatShortDate(resourceSection?.bookingDate)}
                  </span>
                  {resourceSection?.timeSlot
                    ? ` · ${resourceSection.timeSlot}`
                    : ""}
                </p>
                <p className="text-sm text-slate-500">
                  Provider:{" "}
                  <span className="font-medium text-slate-900">
                    {resourceSection?.providerName}
                  </span>
                </p>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-2">
                <Badge
                  className={`capitalize ${getStatusBadgeClass(
                    booking.status,
                  )} rounded-full px-3 py-1 text-xs font-semibold`}
                >
                  {booking.status || "—"}
                </Badge>
                <Badge
                  className={`capitalize ${getStatusBadgeClass(
                    booking.paymentStatus,
                  )} rounded-full px-3 py-1 text-xs font-semibold`}
                >
                  {booking.paymentStatus || "—"}
                </Badge>
              </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 space-y-3">
                <h2 className="text-sm font-semibold text-slate-900">
                  Booking details
                </h2>
                <dl className="space-y-2.5 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Quantity</dt>
                    <dd className="text-slate-900 font-medium">
                      {resourceSection?.quantity}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Customer</dt>
                    <dd className="text-slate-900 font-medium">
                      {customerSection?.name}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Created</dt>
                    <dd className="text-slate-900 font-medium">
                      {formatShortDate(summary?.createdAt)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-2xl border border-slate-100 bg-white px-5 py-4 space-y-3">
                <h2 className="text-sm font-semibold text-slate-900">
                  Payment summary
                </h2>
                <dl className="space-y-2.5 text-sm">
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Total</dt>
                    <dd className="text-base font-semibold text-slate-900">
                      {formatCurrency(
                        priceSection.totalPrice,
                        priceSection.currency,
                      )}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <dt className="text-slate-500">Quantity</dt>
                    <dd className="text-slate-900 font-medium">
                      {priceSection.quantity}
                    </dd>
                  </div>
                </dl>
              </div>
            </section>

            <section className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleContactProvider}
                  className="cursor-pointer rounded-full border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-colors"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact provider
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancelBooking}
                  className="cursor-pointer rounded-full text-rose-600 hover:bg-rose-50"
                >
                  <XCircle className="mr-2 h-4 w-4" />
                  {actionLoading ? "Cancelling..." : "Cancel booking"}
                </Button>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}

