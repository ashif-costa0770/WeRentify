"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import {
  verifyServiceBookingSession,
  verifyListingBookingSession,
} from "@/services/payments.service";

function BookingSuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const type = searchParams.get("type") || "service";

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingId, setBookingId] = useState("");

  useEffect(() => {
    let cancelled = false;

    const verifyPayment = async () => {
      if (!sessionId) {
        setError("Missing Stripe session id.");
        setIsLoading(false);
        return;
      }

      try {
        const isListing = type === "listing";
        const res = isListing
          ? await verifyListingBookingSession(sessionId)
          : await verifyServiceBookingSession(sessionId);
        const booking = res?.data?.data?.booking;
        if (!cancelled) {
          setBookingId(booking?._id || "");
          setError("");
        }
      } catch (verifyError) {
        if (!cancelled) {
          setError(
            verifyError?.response?.data?.message ||
              "Payment was completed but booking verification failed. Please contact support.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    verifyPayment();

    return () => {
      cancelled = true;
    };
  }, [sessionId, type]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 text-center">
        {isLoading ? (
          <div className="py-8">
            <Loader2 className="mx-auto mb-4 h-10 w-10 animate-spin text-indigo-600" />
            <h1 className="text-xl font-bold text-gray-900">Verifying payment...</h1>
            <p className="mt-2 text-sm text-gray-500">Please wait while we confirm your booking.</p>
          </div>
        ) : error ? (
          <div className="py-2">
            <h1 className="text-2xl font-bold text-red-600">Verification Failed</h1>
            <p className="mt-3 text-sm text-gray-600">{error}</p>
            <button
              onClick={() =>
                router.push(type === "listing" ? "/" : "/services")
              }
              className="mt-6 w-full cursor-pointer rounded-2xl border border-gray-300 px-6 py-3 font-medium text-gray-700 hover:bg-gray-50"
            >
              {type === "listing" ? "Back to Listings" : "Back to Services"}
            </button>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <div className="bg-green-50 p-3 rounded-full">
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Successful</h1>
            <p className="mt-2 text-gray-500">
              {type === "listing"
                ? "Your listing booking has been confirmed."
                : "Your service booking has been confirmed."}
            </p>
            {bookingId ? (
              <p className="mt-3 text-xs text-gray-500">
                Booking ID: <span className="font-semibold text-gray-700">{bookingId}</span>
              </p>
            ) : null}

            <button
              onClick={() => router.push("/profile")}
              className="mt-8 w-full cursor-pointer flex items-center justify-center gap-2 bg-black text-white px-6 py-4 rounded-2xl font-medium hover:bg-gray-800 transition-all active:scale-95 shadow-md hover:shadow-lg"
            >
              Go to Profile
              <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function BookingSuccessPage() {
  return (
    <Suspense fallback={null}>
      <BookingSuccessContent />
    </Suspense>
  );
}
