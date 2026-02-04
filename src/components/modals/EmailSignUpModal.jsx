"use client";

import { useState } from "react";

export default function EmailSignUpModal({
  open,
  onClose,
  onSwitchToSignIn,
  setIsLogin,
}) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("US");

  const countries = [
    { code: "US", name: "United States", dialCode: "+1" },
    { code: "GB", name: "United Kingdom", dialCode: "+44" },
    { code: "CA", name: "Canada", dialCode: "+1" },
    { code: "AU", name: "Australia", dialCode: "+61" },
    { code: "DE", name: "Germany", dialCode: "+49" },
    { code: "FR", name: "France", dialCode: "+33" },
    { code: "JP", name: "Japan", dialCode: "+81" },
    { code: "CN", name: "China", dialCode: "+86" },
    { code: "IN", name: "India", dialCode: "+91" },
    { code: "BR", name: "Brazil", dialCode: "+55" },
  ];

  const selectedCountry = countries.find((c) => c.code === country);

  const handleContinue = () => {
    console.log("Phone:", selectedCountry.dialCode, phoneNumber);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10001] p-4">
      <div className="relative max-w-md w-full max-h-[90vh] bg-white rounded-3xl shadow-2xl animate-slideUp flex flex-col">
        {/* Scrollable Content */}
        <div className="overflow-y-auto p-8 custom-scrollbar">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute cursor-pointer top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors z-10"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Title */}
          <h1 className="text-3xl font-black bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent mb-2">
            Welcome to WeRentify
          </h1>

          <p className="text-gray-600 mb-8">
            Log in or sign up to continue
          </p>

          {/* Country Selector */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Country/Region
            </label>
            <div className="relative">
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-900 bg-white appearance-none cursor-pointer focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name} ({c.dialCode})
                  </option>
                ))}
              </select>
              <svg
                className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M6 9l6 6 6-6" />
              </svg>
            </div>
          </div>

          {/* Phone Number Input */}
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Phone number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Phone number"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Disclaimer */}
          <p className="text-xs text-gray-500 mb-4">
            We will call or text you to confirm your number. Standard message and data rates apply.
          </p>

          {/* Continue Button */}
          <button
            onClick={handleContinue}
            className="w-full cursor-pointer py-3 px-4 rounded-xl font-bold text-white bg-gradient-to-r from-indigo-600 to-pink-500 hover:opacity-90 transition-opacity shadow-lg shadow-indigo-500/25"
          >
            Continue
          </button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="space-y-3">
            {/* Google */}
            <button
              onClick={() => {
                setIsLogin(true);
                onClose();
              }}
              className="w-full cursor-pointer flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.55 1.18 5.07l2.85-2.07.81-.91z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.5 2.09 14.91 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            {/* Apple */}
            <button
              onClick={() => {
                setIsLogin(true);
                onClose();
              }}
              className="w-full cursor-pointer flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.88-3.08.35-1.09-.56-2.09-.48-3.2.04-1.44.71-2.28.44-3.21-.35C3.44 16.3 4.38 9.57 9.4 9.25c1.27.07 2.22.74 2.98.8 1.14-.23 2.24-.88 3.46-.79 1.47.12 2.58.7 3.29 1.76-2.9 1.77-2.38 5.98.22 7.13-.57 1.5-1.31 2.99-2.3 4.13zm-5.85-15.1c.07-2.04 1.76-3.79 3.78-3.94.29 2.32-1.93 4.48-3.78 3.94z" />
              </svg>
              Continue with Apple
            </button>

            {/* Email */}
            <button
              onClick={() => {
                setIsLogin(true);
                onClose();
              }}
              className="w-full cursor-pointer flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m2 7 10 6 10-6" />
              </svg>
              Continue with email
            </button>

            {/* Facebook */}
            <button
              onClick={() => {
                setIsLogin(true);
                onClose();
              }}
              className="w-full cursor-pointer flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              Continue with Facebook
            </button>
          </div>

          {/* Footer */}
          <p className="text-sm text-gray-600 mt-6 text-center pb-2">
            Already have an account?{" "}
            <button
              onClick={onSwitchToSignIn}
              className="text-indigo-600 font-bold hover:underline cursor-pointer"
            >
              Log in
            </button>
          </p>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
          border-radius: 20px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgba(156, 163, 175, 0.8);
        }
      `}</style>
    </div>
  );
}