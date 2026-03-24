"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import {
  resendForgotPasswordOtpAPI,
  verifyForgotPasswordOtpAPI,
  changeForgotPasswordAPI,
} from "@/services/auth.service";

export default function ForgotPasswrodModal({ isOpen, onClose, email, onClosed }) {
  const RESEND_COOLDOWN_SECONDS = 60;
  const [step, setStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpError, setOtpError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isResendingOtp, setIsResendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(RESEND_COOLDOWN_SECONDS);

  const resetState = () => {
    setStep(1);
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setOtpError("");
    setPasswordError("");
    setIsResendingOtp(false);
    setIsVerifyingOtp(false);
    setIsChangingPassword(false);
    setResendSeconds(RESEND_COOLDOWN_SECONDS);
  };

  useEffect(() => {
    if (isOpen) {
      setResendSeconds(RESEND_COOLDOWN_SECONDS);
      return;
    }
    resetState();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || resendSeconds <= 0) return;
    const timer = setInterval(() => {
      setResendSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, resendSeconds]);

  const handleClose = () => {
    onClose();
    if (onClosed) onClosed();
  };

  const handleResendOtp = async () => {
    if (!email?.trim() || resendSeconds > 0) return;
    try {
      setIsResendingOtp(true);
      await resendForgotPasswordOtpAPI(email.trim().toLowerCase());
      toast.success("OTP resent successfully.");
      setResendSeconds(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to resend OTP";
      toast.error(message);
    } finally {
      setIsResendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedOtp = otp.trim();

    if (!normalizedEmail) {
      setOtpError("Email is required");
      return;
    }

    if (!/^\d{4,8}$/.test(normalizedOtp)) {
      setOtpError("Enter a valid OTP (4-8 digits)");
      return;
    }

    try {
      setIsVerifyingOtp(true);
      setOtpError("");
      await verifyForgotPasswordOtpAPI(normalizedEmail, normalizedOtp);
      toast.success("OTP verified.");
      setStep(2);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "OTP verification failed";
      setOtpError(message);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleSubmitNewPassword = async () => {
    const normalizedEmail = email?.trim().toLowerCase();
    const pwd = newPassword.trim();
    const confirm = confirmPassword.trim();

    if (!normalizedEmail) {
      setPasswordError("Email is required");
      return;
    }
    if (pwd.length < 8) {
      setPasswordError("Password must be at least 8 characters");
      return;
    }
    if (pwd !== confirm) {
      setPasswordError("Passwords do not match");
      return;
    }

    try {
      setIsChangingPassword(true);
      setPasswordError("");
      await changeForgotPasswordAPI(normalizedEmail, pwd, confirm);
      toast.success("Password changed successfully.");
      handleClose();
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to change password";
      setPasswordError(message);
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Forgot Password</h2>
          <button
            type="button"
            onClick={handleClose}
            className="cursor-pointer rounded-full p-1 text-gray-500"
          >
            <X size={18} />
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Step 1: Verify OTP sent to <span className="font-medium">{email}</span>
            </p>
            <div>
              <label className="text-sm font-medium text-gray-700">OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(event) => {
                  setOtp(event.target.value.replace(/\D/g, ""));
                  if (otpError) setOtpError("");
                }}
                placeholder="Enter OTP"
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
              {otpError ? <p className="mt-1 text-xs text-red-500">{otpError}</p> : null}
            </div>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isResendingOtp || resendSeconds > 0}
                className="cursor-pointer text-sm font-medium text-indigo-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isResendingOtp
                  ? "Sending..."
                  : resendSeconds > 0
                    ? `Resend OTP in ${resendSeconds}s`
                    : "Resend OTP"}
              </button>
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isVerifyingOtp}
                className="cursor-pointer rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Step 2: Set your new password</p>
            <div>
              <label className="text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => {
                  setNewPassword(event.target.value);
                  if (passwordError) setPasswordError("");
                }}
                placeholder="Enter new password"
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => {
                  setConfirmPassword(event.target.value);
                  if (passwordError) setPasswordError("");
                }}
                placeholder="Confirm new password"
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            {passwordError ? <p className="text-xs text-red-500">{passwordError}</p> : null}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setPasswordError("");
                }}
                className="cursor-pointer rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmitNewPassword}
                disabled={isChangingPassword}
                className="cursor-pointer rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isChangingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
