"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { XCircle, ArrowLeft } from "lucide-react";

function CancelContent() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      {/* Matching the success page shadow and border-radius */}
      <div className="max-w-sm w-full bg-white p-8 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 text-center">
        
        {/* Cancel Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-red-50 p-3 rounded-full">
            <XCircle className="w-12 h-12 text-red-500" />
          </div>
        </div>

        {/* Text */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Cancelled
        </h1>
        <p className="text-gray-500 mb-8 px-2">
          Your transaction was not completed. No charges were made to your account.
        </p>

        {/* Action Button */}
        <button
          onClick={() => router.push("/profile")} // Or wherever your checkout starts
          className="w-full cursor-pointer flex items-center justify-center gap-2 bg-black text-white px-6 py-4 rounded-2xl font-medium hover:bg-gray-800 transition-all active:scale-95 shadow-md hover:shadow-lg"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Plans
        </button>

        <button 
          onClick={() => router.push("/")}
          className="mt-4 cursor-pointer text-sm text-gray-400 hover:text-gray-600 transition-colors font-medium"
        >
          Return Home
        </button>
      </div>
    </div>
  );
}

export default function SimpleCancelPage() {
  return (
    <Suspense fallback={null}>
      <CancelContent />
    </Suspense>
  );
}