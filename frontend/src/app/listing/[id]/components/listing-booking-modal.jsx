"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Loader2, MapPin, X } from "lucide-react";
import { toast } from "sonner";
import { createBooking } from "@/services/booking.service";
import { createListingBookingCheckoutSession } from "@/services/payments.service";
import { useUser } from "@/context/UserContext";

function toDateOnlyString(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDateLabel(value) {
  if (!value) return "Not selected";
  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function computeRentalDays(startDate, endDate) {
  if (!startDate || !endDate) return 0;
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const diffMs = end.getTime() - start.getTime();
  const dayMs = 1000 * 60 * 60 * 24;
  const raw = Math.round(diffMs / dayMs);
  return raw > 0 ? raw : 0;
}

function computeListingPrice(listing, rentalDays, platformFeePercent) {
  const dailyRate = Number(listing?.dailyRate || 0) || 0;
  const hourlyRate = Number(listing?.hourlyRate || 0) || 0;
  const weeklyRate = Number(listing?.weeklyRate || 0) || 0;

  const fallbackDayRate = dailyRate || (hourlyRate > 0 ? hourlyRate * 24 : 0);
  if (rentalDays <= 0 || !fallbackDayRate) {
    return { baseAmount: 0, platformFee: 0, totalPrice: 0 };
  }

  let baseAmount = 0;
  if (weeklyRate > 0 && rentalDays >= 7) {
    const weeks = Math.floor(rentalDays / 7);
    const extraDays = rentalDays - weeks * 7;
    baseAmount = weeks * weeklyRate + extraDays * fallbackDayRate;
  } else {
    baseAmount = rentalDays * fallbackDayRate;
  }

  const feePercent = Math.max(Number(platformFeePercent || 0), 0);
  const platformFee = Math.max((baseAmount * feePercent) / 100, 0);
  const totalPrice = Math.max(baseAmount + platformFee, 0);

  return { baseAmount, platformFee, totalPrice };
}

export default function ListingBookingModal({ listing, open, onClose }) {
  const { user } = useUser();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState("form"); // form | confirmation
  const [confirmationData, setConfirmationData] = useState(null);

  const platformFeePercent = useMemo(
    () => Number(user?.plan?.platformFeePercent ?? 0),
    [user?.plan?.platformFeePercent],
  );

  useEffect(() => {
    if (!open) return;
    const today = toDateOnlyString(new Date());
    setStartDate(today);
    setEndDate("");
    setAddress("");
    setNotes("");
    setPaymentMethod("cod");
    setErrors({});
    setIsProcessing(false);
    setStep("form");
    setConfirmationData(null);
  }, [open]);

  if (!open || !listing) return null;

  const rentalDays = computeRentalDays(startDate, endDate);
  const { baseAmount, platformFee, totalPrice } = computeListingPrice(
    listing,
    rentalDays,
    platformFeePercent,
  );

  const validateForm = () => {
    const nextErrors = {};
    if (!startDate) nextErrors.startDate = "Please select a start date";
    if (!endDate) nextErrors.endDate = "Please select an end date";
    const days = computeRentalDays(startDate, endDate);
    if (startDate && endDate && days <= 0) {
      nextErrors.endDate = "End date must be after start date";
    }
    if (listing.offerDelivery && !address.trim()) {
      nextErrors.address = "Address is required for delivery";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const completeBooking = (method) => {
    setConfirmationData({
      listingName: listing.itemName || listing.name,
      providerId:
        (typeof listing.owner === "object" ? listing.owner?._id : listing.owner) || "",
      startDate,
      endDate,
      paymentMethod: method,
      totalPrice,
    });
    setStep("confirmation");
  };

  const buildBookingPayload = () => {
    const payload = {
      bookingType: "listing",
      resourceModel: "Listing",
      resource: listing._id || listing.id,
      startDate,
      endDate,
      quantity: 1,
      notes: notes.trim() || undefined,
      paymentMethod,
      paymentProvider: paymentMethod === "card" ? "stripe" : undefined,
      currency: "USD",
      unitPrice: baseAmount,
      platformFee,
      totalPrice,
    };

    if (listing.offerDelivery && address.trim()) {
      payload.address = address.trim();
    }

    return payload;
  };

  const handleConfirmBooking = async () => {
    if (!validateForm()) return;
    setIsProcessing(true);
    try {
      if (paymentMethod === "card") {
        const listingRefId = listing._id || listing.id;
        const checkoutRes = await createListingBookingCheckoutSession({
          listingId: listingRefId,
          startDate,
          endDate,
          address: listing.offerDelivery ? address.trim() : undefined,
          notes: notes.trim() || undefined,
        });
        const checkoutUrl = checkoutRes?.data?.data?.url;
        if (!checkoutUrl) {
          throw new Error("Checkout URL not found");
        }
        window.location.href = checkoutUrl;
        return;
      }

      const payload = buildBookingPayload();
      await createBooking(payload);
      completeBooking("cod");
      toast.success("Booking confirmed successfully.");
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to create booking";
      toast.error(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (isProcessing) return;
    onClose?.();
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-2xl bg-white shadow-2xl p-2">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-500">
              Book listing
            </p>
            <h2 className="text-lg font-bold text-gray-900">
              {listing.itemName || listing.name}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full cursor-pointer p-2 text-gray-500 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-4 py-4">
          {step === "form" ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    Start date
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm">
                    <CalendarDays className="h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full border-none bg-transparent text-gray-800 outline-none"
                    />
                  </div>
                  {errors.startDate && (
                    <p className="mt-1 text-xs text-red-600">{errors.startDate}</p>
                  )}
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    End date
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm">
                    <CalendarDays className="h-4 w-4 text-gray-400" />
                    <input
                      type="date"
                      value={endDate}
                      min={startDate || undefined}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full border-none bg-transparent text-gray-800 outline-none"
                    />
                  </div>
                  {errors.endDate && (
                    <p className="mt-1 text-xs text-red-600">{errors.endDate}</p>
                  )}
                </div>
              </div>

              {listing.offerDelivery && (
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-600">
                    Delivery address
                  </label>
                  <div className="flex items-start gap-2 rounded-xl border border-gray-300 px-3 py-2 text-sm">
                    <MapPin className="mt-1 h-4 w-4 text-gray-400" />
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={2}
                      className="w-full resize-none border-none bg-transparent text-gray-800 outline-none"
                      placeholder="Enter where you want the item delivered"
                    />
                  </div>
                  {errors.address && (
                    <p className="mt-1 text-xs text-red-600">{errors.address}</p>
                  )}
                </div>
              )}

              <div>
                <label className="mb-1 block text-xs font-semibold text-gray-600">
                  Notes (optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm text-gray-800 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
                  placeholder="Share any details with the owner (pickup times, etc.)"
                />
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Payment method
                </p>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cod")}
                    className={`rounded-xl border px-3 py-2 font-semibold cursor-pointer ${
                      paymentMethod === "cod"
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Cash on delivery
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`rounded-xl border px-3 py-2 font-semibold cursor-pointer ${
                      paymentMethod === "card"
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Pay by card
                  </button>
                </div>
              </div>

              <div className="rounded-2xl bg-gray-50 p-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-semibold text-gray-900">
                    {rentalDays > 0
                      ? `${rentalDays} day${rentalDays > 1 ? "s" : ""}`
                      : "Select dates"}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
                  <span>Base rental</span>
                  <span>
                    {baseAmount > 0 ? `$${baseAmount.toFixed(2)}` : "--"}
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs text-gray-600">
                  <span>Platform fee</span>
                  <span>
                    {platformFee > 0 ? `$${platformFee.toFixed(2)}` : "$0.00"}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-700">
                    Total
                  </span>
                  <span className="text-base font-bold text-gray-900">
                    {totalPrice > 0 ? `$${totalPrice.toFixed(2)}` : "--"}
                  </span>
                </div>
              </div>
            </>
          ) : (
            confirmationData && (
              <div className="space-y-3 text-sm text-gray-700">
                <p className="text-sm text-gray-600">
                  Your booking has been created successfully.
                </p>
                <div className="rounded-2xl bg-gray-50 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Listing</span>
                    <span className="font-semibold">
                      {confirmationData.listingName}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Dates</span>
                    <span className="text-xs font-medium text-gray-900">
                      {formatDateLabel(confirmationData.startDate)} –{" "}
                      {formatDateLabel(confirmationData.endDate)}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Payment method</span>
                    <span className="text-xs font-medium text-gray-900">
                      {confirmationData.paymentMethod === "card"
                        ? "Card"
                        : "Cash on delivery"}
                    </span>
                  </div>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-gray-500">Total paid</span>
                    <span className="text-sm font-bold text-gray-900">
                      ${confirmationData.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        <div className="flex items-center justify-between border-t px-4 py-3">
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl cursor-pointer border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
            disabled={isProcessing}
          >
            {step === "form" ? "Cancel" : "Close"}
          </button>
          {step === "form" && (
            <button
              type="button"
              onClick={handleConfirmBooking}
              disabled={isProcessing || totalPrice <= 0 || !startDate || !endDate}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4  animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Confirm booking
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

