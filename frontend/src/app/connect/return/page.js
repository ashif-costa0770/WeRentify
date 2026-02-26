"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ArrowRight, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useUser } from "@/context/UserContext";

function ReturnContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useUser();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const refreshUser = async () => {
      try {
        const res = await api.get("/auth/me");
        if (res.data?.success && res.data?.data) {
          setUser(res.data.data);
        }
      } catch (err) {
        console.error("Failed to refresh user after Connect return:", err);
      } finally {
        setLoading(false);
      }
    };

    refreshUser();
  }, [setUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#5B4FE9] animate-spin" />
          <p className="text-gray-500">Finishing setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-sm w-full bg-white p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-green-50 p-3 rounded-full">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Stripe connected
        </h1>
        <p className="text-gray-500 mb-8">
          You can now receive payments from your listings.
        </p>
        <button
          onClick={() => router.push("/?openListing=1")}
          className="w-full cursor-pointer flex items-center justify-center gap-2 bg-[#5B4FE9] text-white px-6 py-4 rounded-2xl font-medium hover:bg-[#4a43c7] transition-all active:scale-95 shadow-md hover:shadow-lg mb-3"
        >
          Create listing
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={() => router.push("/profile")}
          className="w-full cursor-pointer text-sm text-gray-500 hover:text-gray-700 font-medium"
        >
          Go to Profile
        </button>
      </div>
    </div>
  );
}

export default function ConnectReturnPage() {
  return (
    <Suspense fallback={null}>
      <ReturnContent />
    </Suspense>
  );
}
