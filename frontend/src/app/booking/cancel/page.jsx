"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, XCircle } from "lucide-react";

export default function BookingCancelPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-red-50 p-3 rounded-full">
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900">Payment Cancelled</h1>
        <p className="mt-2 text-gray-500">
          No charge was made. You can try booking again whenever you are ready.
        </p>

        <button
          onClick={() => router.push("/services")}
          className="mt-8 w-full cursor-pointer flex items-center justify-center gap-2 rounded-2xl border border-gray-300 px-6 py-4 font-medium text-gray-700 hover:bg-gray-50"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Services
        </button>
      </div>
    </div>
  );
}
