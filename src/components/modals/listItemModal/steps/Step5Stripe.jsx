"use client";

import { CreditCard, Check } from "lucide-react";

export default function Step5Stripe({ formData, setFormData }) {

  const handleConnectStripe = () => {
    setFormData({ ...formData, stripeConnected: true });
  };

  return (
    <div className="text-center">
      {!formData.stripeConnected ? (
        <>
          <div className="bg-indigo-50 rounded-2xl p-8 mb-6">
            <div className="w-16 h-16 bg-yellow-400 rounded-xl mx-auto mb-4 flex items-center justify-center shadow-lg">
              <CreditCard className="w-8 h-8 text-yellow-800" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Connect Your Stripe Account</h3>
            <p className="text-gray-600 text-sm mb-6 max-w-sm mx-auto">
              You&apos;ll need a Stripe account to receive payments. It&apos;s free and takes just a few minutes to set up.
            </p>
            <button
              type="button"
              onClick={handleConnectStripe}
              className="px-8 py-3 bg-[#635BFF] hover:bg-[#554fd8] text-white cursor-pointer font-bold rounded-xl transition-colors shadow-lg"
            >
              Connect with Stripe
            </button>
            <p className="mt-4 text-sm  text-gray-500">
              Don&apos;t have a Stripe account? <button type="button" className="text-[#5B4FE9] hover:underline font-medium cursor-pointer">Sign up here</button>
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span className="text-yellow-500">💡</span>
            <span>You only need to do this once. Future listings will skip this step.</span>
          </div>
        </>
      ) : (
        <div className="bg-green-50 rounded-2xl p-8 mb-6 animate-in zoom-in">
          <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Stripe Connected!</h3>
          <p className="text-gray-600 text-sm">You&apos;re all set to receive payments.</p>
        </div>
      )}
    </div>
  );
}