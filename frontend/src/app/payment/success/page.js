"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight } from "lucide-react";
import api from "@/lib/api";

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const router = useRouter();

  useEffect(() => {
    if (!sessionId) return;

    const verifyPayment = async () => {
      try {
        const res = await api.get(`/payments/verify-session/${sessionId}`);
        console.log("✅ Plan upgrade confirmed");

        // Get the plan from the response and update localStorage
        if (res.data?.plan && typeof window !== "undefined") {
          localStorage.setItem("userPlan", res.data.plan);
          // Trigger a custom event to notify other components
          window.dispatchEvent(
            new CustomEvent("plan-updated", {
              detail: { plan: res.data.plan },
            }),
          );
        }
      } catch (err) {
        console.error("❌ Verification failed", err);
      }
    };

    verifyPayment();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      {/* Added shadow-xl and ring for a polished, elevated look */}
      <div className="max-w-sm w-full bg-white p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-green-50 p-3 rounded-full">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
        </div>

        {/* Text */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Successful
        </h1>
        <p className="text-gray-500 mb-8">
          Your account has been upgraded successfully.
        </p>

        {/* Action Button */}
        <button
          onClick={() => router.push("/profile")}
          className="w-full cursor-pointer flex items-center justify-center gap-2 bg-black text-white px-6 py-4 rounded-2xl font-medium hover:bg-gray-800 transition-all active:scale-95 shadow-md hover:shadow-lg"
        >
          Go to Profile
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function SimpleSuccessPage() {
  return (
    <Suspense fallback={null}>
      <SuccessContent />
    </Suspense>
  );
}
