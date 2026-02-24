"use client";

import {
  registerAPI,
  resendOtpAPI,
  verifyEmailAPI,
  verifyOtpAPI,
} from "@/services/auth.service";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function EmailSignUpModal({
  open,
  onClose,
  onSwitchToSignIn,
  setIsLogin,
}) {
  const router = useRouter();
  // 3-step registration flow:
  // 1) generate OTP by email, 2) verify OTP, 3) set password and create account.
  const [step, setStep] = useState(1);
  const [firstname, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);

  const isNameValid = firstname.length >= 2;
  const isValidEmail = /\S+@\S+\.\S+/.test(email.trim());
  const isOtpValid = otp.trim().length >= 6;
  const isPasswordValid = password.length >= 4;
  const isConfirmValid = confirmPassword.length >= 4;
  const passwordsMatch = password === confirmPassword;

  const resetForm = () => {
    setStep(1);
    setFirstName("");
    setEmail("");
    setOtp("");
    setPassword("");
    setConfirmPassword("");
    setIsLoading(false);
    setResendSeconds(0);
  };

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = setInterval(() => {
      setResendSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendSeconds]);

  const handleClose = () => {
    // Ensure modal always reopens from step 1 with clean inputs.
    resetForm();
    onClose();
  };

  const handleGenerateOtp = async (e) => {
    e.preventDefault();
    if (!isNameValid) {
      toast.error("Please enter a valid name");
      return;
    }

    if (!isValidEmail) {
      toast.error("Please enter a valid email");
      return;
    }

    try {
      setIsLoading(true);
      // Step 1 backend call: request OTP for entered email.
      await verifyEmailAPI(email.trim().toLowerCase());
      toast.success("OTP generated and sent to your email");
      setResendSeconds(60);
      setStep(2);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to generate OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!isOtpValid) {
      toast.error("Please enter a valid OTP");
      return;
    }

    try {
      setIsLoading(true);
      // Step 2 backend call: verify user-entered OTP.
      await verifyOtpAPI(email.trim().toLowerCase(), otp.trim());
      toast.success("Email verified successfully");
      setStep(3);
    } catch (error) {
      toast.error(error?.response?.data?.message || "OTP verification failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setIsLoading(true);
      // Supports OTP resend without leaving step 2.
      await resendOtpAPI(email.trim().toLowerCase());
      toast.success("OTP resent successfully");
      setResendSeconds(60);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to resend OTP");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!isPasswordValid || !isConfirmValid) {
      toast.error("Password must be at least 4 characters");
      return;
    }
    if (!passwordsMatch) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      setIsLoading(true);
      // Step 3 backend call: create user account with verified email + password.
      await registerAPI(
        firstname.trim(),
        email.trim().toLowerCase(),
        password,
        confirmPassword,
      );
      toast.success("Account created successfully");
      // Signup is auto-login on your backend/frontend flow.
      setIsLogin(true);
      resetForm();
      // Close nested signup modals and go to home page.
      onClose();
      router.push("/");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Signup failed");
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10001] p-4">
      <div className="relative max-w-md w-full max-h-[90vh] bg-white rounded-3xl shadow-2xl animate-slideUp flex flex-col">
        <div className="overflow-y-auto p-8 custom-scrollbar">
          <button
            onClick={handleClose}
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

          <h1 className="text-2xl font-black bg-gradient-to-r from-indigo-600 to-pink-500 bg-clip-text text-transparent">
            Create your account
          </h1>
          <p className="text-gray-600 mb-6">Complete all 3 steps to sign up</p>

          <div className="grid grid-cols-3 gap-2 mb-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="flex flex-col items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center ${
                    step >= item
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {item}
                </div>
                <p className="text-[11px] text-gray-500">
                  {item === 1
                    ? "Email"
                    : item === 2
                      ? "OTP Verify"
                      : "Set Password"}
                </p>
              </div>
            ))}
          </div>

          {step === 1 && (
            <form onSubmit={handleGenerateOtp} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  value={firstname}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={!isNameValid || !isValidEmail || isLoading}
                className={`w-full cursor-pointer py-3 px-4 rounded-xl font-bold text-white transition-all ${
                 !isNameValid || !isValidEmail || isLoading
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-linear-to-r from-indigo-600 to-pink-500 hover:opacity-90"
                }`}
              >
                {isLoading ? "Generating OTP..." : "Generate OTP"}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="rounded-xl bg-indigo-50 border border-indigo-100 px-3 py-2 text-xs text-indigo-700">
                OTP sent to <span className="font-semibold">{email}</span>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Enter OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\s/g, "").slice(0, 6))
                  }
                  placeholder="Enter OTP"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors tracking-[0.2em]"
                />
              </div>

              <button
                type="submit"
                disabled={!isOtpValid || isLoading}
                className={`w-full cursor-pointer py-3 px-4 rounded-xl font-bold text-white transition-all ${
                  !isOtpValid || isLoading
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-linear-to-r from-indigo-600 to-pink-500 hover:opacity-90"
                }`}
              >
                {isLoading ? "Verifying..." : "Verify Email"}
              </button>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-sm cursor-pointer text-gray-500 hover:text-gray-700"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading || resendSeconds > 0}
                  className="text-sm cursor-pointer text-indigo-600 font-semibold hover:underline disabled:opacity-50"
                >
                  {resendSeconds > 0
                    ? `Resend OTP in ${resendSeconds}s`
                    : "Resend OTP"}
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set password"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {!passwordsMatch && confirmPassword.length > 0 && (
                <p className="text-xs text-rose-500">Passwords do not match</p>
              )}

              <button
                type="submit"
                disabled={
                  !isPasswordValid ||
                  !isConfirmValid ||
                  !passwordsMatch ||
                  isLoading
                }
                className={`w-full cursor-pointer py-3 px-4 rounded-xl font-bold text-white transition-all ${
                  !isPasswordValid ||
                  !isConfirmValid ||
                  !passwordsMatch ||
                  isLoading
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-linear-to-r from-indigo-600 to-pink-500 hover:opacity-90"
                }`}
              >
                {isLoading ? "Signing Up..." : "Sign Up"}
              </button>

              <button
                type="button"
                onClick={() => setStep(2)}
                className="w-full text-sm cursor-pointer text-gray-500 hover:text-gray-700"
              >
                Back
              </button>
            </form>
          )}

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
    </div>
  );
}
