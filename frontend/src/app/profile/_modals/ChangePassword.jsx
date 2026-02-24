"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";
import {
  resendPasswordOtp,
  verifyPasswordOtp,
  changePassword,
} from "@/services/user.service";

export default function ChangePasswordModal({ isOpen, onClose, email, onClosed }) {
  const RESEND_COOLDOWN_SECONDS = 60;
  const [passwordStep, setPasswordStep] = useState(1);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpError, setOtpError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(RESEND_COOLDOWN_SECONDS);

  const resetState = () => {
    setPasswordStep(1);
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setOtpError("");
    setPasswordError("");
    setIsSendingOtp(false);
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
    if (resendSeconds > 0) return;
    try {
      setIsSendingOtp(true);
      await resendPasswordOtp();
      toast.success("OTP resent successfully.");
      setResendSeconds(RESEND_COOLDOWN_SECONDS);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to resend OTP";
      toast.error(message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    const normalizedOtp = otp.trim();
    if (!/^\d{4,8}$/.test(normalizedOtp)) {
      setOtpError("Enter a valid OTP (4-8 digits)");
      return;
    }

    try {
      setIsVerifyingOtp(true);
      setOtpError("");
      await verifyPasswordOtp({ otp: normalizedOtp });
      setPasswordStep(2);
      toast.success("OTP verified.");
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
    const pwd = newPassword.trim();
    const confirm = confirmPassword.trim();

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
      await changePassword({ password: pwd, confirmPassword: confirm });
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
          <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-full p-1 text-gray-500 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {passwordStep === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Step 1: Enter OTP sent to <span className="font-medium">{email}</span>
            </p>
            <div>
              <label className="text-sm font-medium text-gray-700">OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ""));
                  if (otpError) setOtpError("");
                }}
                placeholder="Enter OTP"
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
              {otpError && <p className="mt-1 text-xs text-red-500">{otpError}</p>}
            </div>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isSendingOtp || resendSeconds > 0}
                className="text-sm font-medium cursor-pointer text-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSendingOtp
                  ? "Sending..."
                  : resendSeconds > 0
                    ? `Resend OTP in ${resendSeconds}s`
                    : "Resend OTP"}
              </button>
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={isVerifyingOtp}
                className="rounded-xl bg-indigo-600 cursor-pointer px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
              </button>
            </div>
          </div>
        )}

        {passwordStep === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Step 2: Set your new password</p>
            <div>
              <label className="text-sm font-medium text-gray-700">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
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
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (passwordError) setPasswordError("");
                }}
                placeholder="Confirm new password"
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
              />
            </div>
            {passwordError && <p className="text-xs text-red-500">{passwordError}</p>}
            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setPasswordStep(1);
                  setPasswordError("");
                }}
                className="rounded-xl cursor-pointer border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmitNewPassword}
                disabled={isChangingPassword}
                className="rounded-xl bg-indigo-600 px-5 cursor-pointer py-2.5 text-sm font-semibold text-white disabled:opacity-70 disabled:cursor-not-allowed"
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
