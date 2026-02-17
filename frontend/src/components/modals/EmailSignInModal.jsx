"use client";

import { loginAPI } from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function EmailSignInModal({
  open,
  onClose,
  onSwitchToSignUp,
  setIsLogin,
}) {
  const router = useRouter();
  // Updated login fields to match backend auth API: email + password.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const isValidEmail = /\S+@\S+\.\S+/.test(email.trim());
  const isValidPassword = password.trim().length > 0;

  if (!open) return null;

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!isValidEmail || !isValidPassword) {
      toast.error("Please enter valid credentials");
      return;
    }

    try {
      setIsLoading(true);
      // Backend login endpoint sets auth cookie; frontend updates login state.
      await loginAPI(email.trim().toLowerCase(), password);
      toast.success("Login successful");
      setIsLogin(true);
      onClose();
      const redirectPath =
        typeof window !== "undefined"
          ? new URLSearchParams(window.location.search).get("redirect") || ""
          : "";
      const safeRedirect =
        redirectPath && redirectPath.startsWith("/") ? redirectPath : "/";
      router.push(safeRedirect);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
      <div className="relative max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 animate-slideUp overflow-y-auto max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute cursor-pointer top-6 right-6 text-gray-400 hover:text-gray-600 transition-colors"
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
        <h1 className="text-[27px] font-black mb-2 bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
          Welcome to WeRentify
        </h1>

        {/* Subtitle */}
        <p className="text-gray-600 mb-6">Log in to continue</p>

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={!isValidEmail || !isValidPassword || isLoading}
            className={`w-full py-3 rounded-xl cursor-pointer font-semibold transition-colors ${
              isValidEmail && isValidPassword && !isLoading
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            {isLoading ? "Logging in..." : "Log In"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-sm text-gray-600 mt-6 text-center">
          Don&apos;t have an account?{" "}
          <span
            onClick={onSwitchToSignUp}
            className="text-indigo-600 font-bold cursor-pointer hover:underline"
          >
            Sign up
          </span>
        </p>
      </div>
    </div>
  );
}
