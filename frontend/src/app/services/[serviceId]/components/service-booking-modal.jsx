"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, CreditCard, Loader2, MapPin, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";
import { createBooking, getBookedServiceSlots } from "@/services/booking.service";
import { useUser } from "@/context/UserContext";

function normalizeDay(value) {
  return String(value || "").trim().toLowerCase();
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

function getTodayDateInputValue() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildSlotsForSelectedDate(selectedDate, availableSlots, bookedSlots = []) {
  if (!Array.isArray(availableSlots) || availableSlots.length === 0) {
    return [];
  }

  const allSlots = [
    ...new Set(
      availableSlots.flatMap((entry) =>
        Array.isArray(entry?.slots)
          ? entry.slots.map((slot) => String(slot).trim()).filter(Boolean)
          : [],
      ),
    ),
  ];

  if (allSlots.length === 0) return [];

  if (!selectedDate) {
    return allSlots.map((slot) => ({ label: slot, disabled: true }));
  }

  const weekdayLong = normalizeDay(
    new Date(`${selectedDate}T00:00:00`).toLocaleDateString("en-US", {
      weekday: "long",
    }),
  );
  const weekdayShort = weekdayLong.slice(0, 3);

  const daySchedule = availableSlots.find((entry) => {
    const day = normalizeDay(entry?.day);
    return day === weekdayLong || day === weekdayShort || weekdayLong.startsWith(day);
  });

  const configuredSlots = new Set(
    Array.isArray(daySchedule?.slots)
      ? daySchedule.slots.map((slot) => String(slot).trim()).filter(Boolean)
      : [],
  );
  const blockedSlots = new Set(
    Array.isArray(bookedSlots)
      ? bookedSlots.map((slot) => String(slot).trim()).filter(Boolean)
      : [],
  );

  return allSlots.map((slot) => ({
    label: slot,
    disabled: !daySchedule || !configuredSlots.has(slot) || blockedSlots.has(slot),
  }));
}

function getIsOnsiteService(service) {
  return String(service?.serviceMode || "").toLowerCase() === "onsite";
}

export default function ServiceBookingModal({ service, open, onClose }) {
  const router = useRouter();
  const { user } = useUser();
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState("form"); // form | stripe | confirmation
  const [confirmationData, setConfirmationData] = useState(null);
  const [createdBookingId, setCreatedBookingId] = useState(null);
  const [bookedSlots, setBookedSlots] = useState([]);
  const [isLoadingBookedSlots, setIsLoadingBookedSlots] = useState(false);

  const isOnsite = getIsOnsiteService(service);
  const serviceFee = Number(service?._hourlyRateNum || service?.hourlyRate || 0) || 0;
  const platformFeePercent = Number(user?.plan?.platformFeePercent ?? 0);
  const platformFeeAmount = Math.max((serviceFee * platformFeePercent) / 100, 0);
  const totalPrice = Math.max(serviceFee + platformFeeAmount, 0);

  const slotOptions = useMemo(
    () => buildSlotsForSelectedDate(selectedDate, service?.availableSlots, bookedSlots),
    [selectedDate, service?.availableSlots, bookedSlots],
  );

  useEffect(() => {
    if (!open) return;
    setSelectedDate("");
    setSelectedTime("");
    setAddress("");
    setNotes("");
    setPaymentMethod("cod");
    setErrors({});
    setIsProcessing(false);
    setStep("form");
    setConfirmationData(null);
    setCreatedBookingId(null);
    setBookedSlots([]);
    setIsLoadingBookedSlots(false);
  }, [open]);

  useEffect(() => {
    const serviceRefId = service?._id || service?.id;
    if (!open || !selectedDate || !serviceRefId) {
      setBookedSlots([]);
      return;
    }

    let cancelled = false;

    const fetchBookedSlots = async () => {
      setIsLoadingBookedSlots(true);
      try {
        const res = await getBookedServiceSlots(serviceRefId, selectedDate);
        const slots = Array.isArray(res?.data?.data?.bookedSlots) ? res.data.data.bookedSlots : [];
        if (!cancelled) {
          setBookedSlots(slots);
        }
      } catch {
        if (!cancelled) {
          setBookedSlots([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoadingBookedSlots(false);
        }
      }
    };

    fetchBookedSlots();

    return () => {
      cancelled = true;
    };
  }, [open, selectedDate, service?._id, service?.id]);

  useEffect(() => {
    if (!selectedTime) return;
    const stillAvailable = slotOptions.some((slot) => slot.label === selectedTime && !slot.disabled);
    if (!stillAvailable) setSelectedTime("");
  }, [selectedTime, slotOptions]);

  if (!open || !service) return null;

  const locationLabel = isOnsite
    ? address || "Enter service address"
    : String(service?.serviceMode || "").toLowerCase() === "online"
      ? "Online Service"
      : "At Provider Shop";

  const validateForm = () => {
    const nextErrors = {};
    if (!selectedDate) nextErrors.selectedDate = "Please select a service date";
    if (!selectedTime) nextErrors.selectedTime = "Please select a time slot";
    if (isOnsite && !address.trim()) nextErrors.address = "Service address is required for onsite service";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const completeBooking = (method) => {
    setConfirmationData({
      serviceName: service.name,
      providerName: service.provider,
      date: selectedDate,
      time: selectedTime,
      location: locationLabel,
      paymentMethod: method,
    });
    setStep("confirmation");
  };

  const buildBookingPayload = () => {
    const payload = {
      bookingType: "service",
      resourceModel: "Service",
      resource: service?._id || service?.id,
      bookingDate: selectedDate,
      timeSlot: selectedTime,
      quantity: 1,
      notes: notes.trim() || undefined,
      paymentMethod,
      paymentProvider: paymentMethod === "card" ? "stripe" : undefined,
      currency: "USD",
      unitPrice: serviceFee,
      platformFee: platformFeeAmount,
      totalPrice,
    };

    if (isOnsite) {
      payload.address = address.trim();
    }

    return payload;
  };

  const createBookingRequest = async () => {
    const payload = buildBookingPayload();
    const res = await createBooking(payload);
    const created = res?.data?.data || null;
    if (created?._id) {
      setCreatedBookingId(created._id);
    }
    return created;
  };

  const handleConfirmBooking = async () => {
    if (!validateForm()) return;

    setIsProcessing(true);
    try {
      if (paymentMethod === "card") {
        // For card flow: move to Stripe step first.
        setStep("stripe");
        return;
      }

      await createBookingRequest();
      completeBooking("cod");
      toast.success("Booking confirmed successfully.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to confirm booking");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteCardPayment = async () => {
    setIsProcessing(true);
    try {
      await createBookingRequest();
      completeBooking("card");
      toast.success("Payment successful. Booking confirmed.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Payment completed but booking failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleViewBookings = () => {
    onClose();
    router.push("/profile");
  };

  const handleBackToServices = () => {
    onClose();
    router.push("/services");
  };

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-[91] max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-3xl bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer absolute right-4 top-4 rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label="Close booking panel"
        >
          <X size={20} />
        </button>

        {step === "form" ? (
          <div className="grid gap-8 p-6 lg:grid-cols-[1.6fr_1fr] lg:p-8">
            <section className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Book This Service</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Select your date, time, and payment option to confirm this booking.
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="booking-date" className="text-sm font-semibold text-slate-800">
                  Select Date
                </label>
                <input
                  id="booking-date"
                  type="date"
                  min={getTodayDateInputValue()}
                  value={selectedDate}
                  onChange={(event) => setSelectedDate(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
                {errors.selectedDate ? (
                  <p className="text-xs font-medium text-red-600">{errors.selectedDate}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-800">Select Time Slot</p>
                <div className="grid grid-cols-2 gap-2">
                  {slotOptions.length === 0 ? (
                    <p className="col-span-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500">
                      No configured time slots for this service yet.
                    </p>
                  ) : null}
                  {slotOptions.map((slot) => {
                    const isSelected = selectedTime === slot.label;
                    return (
                      <button
                        key={slot.label}
                        type="button"
                        disabled={slot.disabled || isLoadingBookedSlots}
                        onClick={() => setSelectedTime(slot.label)}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition ${
                          slot.disabled || isLoadingBookedSlots
                            ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
                            : isSelected
                              ? "border-indigo-600 bg-indigo-600 text-white"
                              : "border-slate-300 bg-white text-slate-700 hover:border-indigo-500 hover:text-indigo-600"
                        }`}
                      >
                        {slot.label}
                      </button>
                    );
                  })}
                </div>
                {isLoadingBookedSlots ? (
                  <p className="text-xs font-medium text-slate-500">Checking slot availability...</p>
                ) : null}
                {errors.selectedTime ? (
                  <p className="text-xs font-medium text-red-600">{errors.selectedTime}</p>
                ) : null}
              </div>

              {isOnsite ? (
                <div className="space-y-2">
                  <label htmlFor="service-address" className="text-sm font-semibold text-slate-800">
                    Service Address
                  </label>
                  <input
                    id="service-address"
                    type="text"
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                    placeholder="Enter full address where service is needed"
                    className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                  />
                  {errors.address ? (
                    <p className="text-xs font-medium text-red-600">{errors.address}</p>
                  ) : null}
                </div>
              ) : null}

              <div className="space-y-2">
                <label htmlFor="booking-notes" className="text-sm font-semibold text-slate-800">
                  Notes (Optional)
                </label>
                <textarea
                  id="booking-notes"
                  rows={4}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Add any special instructions for the service provider"
                  className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="space-y-2">
                <p className="text-sm font-semibold text-slate-800">Payment Method</p>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 hover:border-indigo-300">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                    className="h-4 w-4 accent-indigo-600"
                  />
                  <span className="text-sm text-slate-700">Cash on Delivery</span>
                </label>
                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 px-3 py-3 hover:border-indigo-300">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={paymentMethod === "card"}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                    className="h-4 w-4 accent-indigo-600"
                  />
                  <span className="text-sm text-slate-700">Card Payment</span>
                </label>
              </div>

              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={isProcessing}
                className="cursor-pointer inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-5 py-3 font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </button>
            </section>

            <aside className="lg:sticky lg:top-8 lg:h-fit">
              <div className="rounded-2xl border border-slate-200 mt-8 bg-slate-50 p-5">
                <h3 className="text-lg font-semibold text-slate-900">Booking Summary</h3>

                <div className="mt-4 space-y-2 text-sm">
                  <p className="text-slate-600">
                    <span className="font-semibold text-slate-900">Service:</span> {service.name}
                  </p>
                  <p className="text-slate-600">
                    <span className="font-semibold text-slate-900">Provider:</span> {service.provider}
                  </p>
                  <p className="text-slate-600">
                    <span className="font-semibold text-slate-900">Selected Date:</span>{" "}
                    {formatDateLabel(selectedDate)}
                  </p>
                  <p className="text-slate-600">
                    <span className="font-semibold text-slate-900">Selected Time:</span>{" "}
                    {selectedTime || "Not selected"}
                  </p>
                  <p className="text-slate-600">
                    <span className="font-semibold text-slate-900">Location:</span> {locationLabel}
                  </p>
                </div>

                <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-sm text-slate-700">Service Fee: ${serviceFee.toFixed(2)}</p>
                  <p className="mt-1 text-sm text-slate-700">
                    Platform Fee ({platformFeePercent}%): ${platformFeeAmount.toFixed(2)}
                  </p>
                  <div className="mt-3 border-t border-slate-200 pt-3">
                    <p className="text-base font-bold text-slate-900">Total: ${totalPrice.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        ) : null}

        {step === "stripe" ? (
          <div className="space-y-6 p-6 lg:p-8">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Stripe Checkout</h2>
              <p className="mt-1 text-sm text-slate-500">
                Redirected to secure payment interface. Complete payment to confirm your booking.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Service:</span> {service.name}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Date & Time:</span>{" "}
                {formatDateLabel(selectedDate)} at {selectedTime}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Amount:</span> ${totalPrice.toFixed(2)}
              </p>
            </div>

            <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-4 text-sm text-indigo-800">
              <p className="flex items-center gap-2">
                <ShieldCheck size={16} />
                Card payment is processed securely through Stripe.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setStep("form")}
                className="cursor-pointer rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                disabled={isProcessing}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleCompleteCardPayment}
                disabled={isProcessing}
                className="cursor-pointer inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isProcessing ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard size={16} className="mr-2" />
                    Complete Card Payment
                  </>
                )}
              </button>
            </div>
          </div>
        ) : null}

        {step === "confirmation" && confirmationData ? (
          <div className="space-y-6 p-6 lg:p-8">
            <div>
              <h2 className="text-2xl font-bold text-emerald-700">Booking Confirmed</h2>
              <p className="mt-1 text-sm text-slate-500">
                Your booking has been successfully confirmed.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
              <p className="text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Service Name:</span>{" "}
                {confirmationData.serviceName}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Provider:</span>{" "}
                {confirmationData.providerName}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Date:</span>{" "}
                {formatDateLabel(confirmationData.date)}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Time:</span>{" "}
                {confirmationData.time}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Location:</span>{" "}
                {confirmationData.location}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                <span className="font-semibold text-slate-900">Payment Method:</span>{" "}
                {confirmationData.paymentMethod === "card" ? "Card" : "Cash on Delivery"}
              </p>
              {createdBookingId ? (
                <p className="mt-1 text-sm text-slate-700">
                  <span className="font-semibold text-slate-900">Booking ID:</span> {createdBookingId}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleViewBookings}
                className="cursor-pointer inline-flex items-center rounded-xl bg-gradient-to-r from-indigo-600 to-fuchsia-600 px-5 py-2.5 text-sm font-semibold text-white"
              >
                <CalendarDays size={16} className="mr-2" />
                View My Bookings
              </button>
              <button
                type="button"
                onClick={handleBackToServices}
                className="cursor-pointer inline-flex items-center rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                <MapPin size={16} className="mr-2" />
                Back to Services
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
