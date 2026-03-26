"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getAdminProfile,
  updateAdminCredentials,
} from "@/services/admin.service";

const emailRegex = /\S+@\S+\.\S+/;
const getBackendErrorMessage = (error, fallbackMessage) => {
  const payload = error?.response?.data;

  if (typeof payload?.errors === "string" && payload.errors.trim()) {
    return payload.errors;
  }

  if (typeof payload?.message === "string" && payload.message.trim()) {
    return payload.message;
  }

  

  if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
    const firstError = payload.errors[0];
    if (typeof firstError === "string" && firstError.trim()) return firstError;
    if (typeof firstError?.message === "string" && firstError.message.trim()) {
      return firstError.message;
    }
  }

  if (payload?.errors && typeof payload.errors === "object") {
    const firstValue = Object.values(payload.errors)[0];
    if (typeof firstValue === "string" && firstValue.trim()) return firstValue;
    if (Array.isArray(firstValue) && firstValue.length > 0) {
      const firstItem = firstValue[0];
      if (typeof firstItem === "string" && firstItem.trim()) return firstItem;
      if (typeof firstItem?.message === "string" && firstItem.message.trim()) {
        return firstItem.message;
      }
    }
  }

  return fallbackMessage;
};

export default function AdminProfilePage() {
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    role: "",
  });

  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchProfile() {
      setLoadingProfile(true);
      try {
        const res = await getAdminProfile();
        const data = res?.data?.data || {};

        if (cancelled) return;

        setProfile({
          name: data?.name || "",
          email: data?.email || "",
          role: data?.role || "",
        });
        setEmail(data?.email || "");
      } catch (fetchError) {
        if (!cancelled) {
          setError(getBackendErrorMessage(fetchError, "Failed to load admin profile"));
        }
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    }

    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, []);

  const wantsPasswordChange = Boolean(newPassword.trim() || confirmPassword.trim());
  const emailChanged = email.trim().toLowerCase() !== profile.email.toLowerCase();

  const validationError = useMemo(() => {
    if (!currentPassword.trim()) {
      return "Current password is required.";
    }

    if (!emailRegex.test(email.trim())) {
      return "Please enter a valid email address.";
    }

    if (wantsPasswordChange) {
      if (newPassword.length < 8) {
        return "New password must be at least 8 characters.";
      }
      if (newPassword !== confirmPassword) {
        return "New password and confirm password must match.";
      }
    }

    if (!emailChanged && !wantsPasswordChange) {
      return "Change email or password before saving.";
    }

    return "";
  }, [confirmPassword, currentPassword, email, emailChanged, newPassword, wantsPasswordChange]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (validationError || submitting) return;

    setSubmitting(true);
    try {
      await updateAdminCredentials({
        email: email.trim().toLowerCase(),
        currentPassword: currentPassword.trim(),
        newPassword: wantsPasswordChange ? newPassword : undefined,
        confirmPassword: wantsPasswordChange ? confirmPassword : undefined,
      });

      setSuccess("Credentials updated successfully.");
      setProfile((prev) => ({ ...prev, email: email.trim().toLowerCase() }));
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (submitError) {
      setError(getBackendErrorMessage(submitError, "Failed to update credentials"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Admin Profile</h1>
        <p className="mt-1 text-sm text-slate-500">
          Update your admin email and password securely.
        </p>
      </div>

      {loadingProfile ? (
        <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
          Loading profile...
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-1">
            <h2 className="text-base font-semibold text-slate-800">
              Account Overview
            </h2>
            <div className="mt-5 space-y-4 text-sm">
              <div>
                <p className="text-slate-500">Name</p>
                <p className="font-medium text-slate-800">{profile.name || "-"}</p>
              </div>
              <div>
                <p className="text-slate-500">Current Email</p>
                <p className="font-medium text-slate-800">{profile.email || "-"}</p>
              </div>
              <div>
                <p className="text-slate-500">Role</p>
                <p className="font-medium capitalize text-slate-800">
                  {(profile.role || "-").replace("_", " ")}
                </p>
              </div>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2"
          >
            <h2 className="text-base font-semibold text-slate-800">
              Change Credentials
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Enter your current password to confirm any change.
            </p>

            <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  placeholder="admin@company.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(event) => setCurrentPassword(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  placeholder="Leave empty to keep existing"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
                  placeholder="Retype new password"
                />
              </div>
            </div>

            {error ? (
              <p className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            ) : null}
            {success ? (
              <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                {success}
              </p>
            ) : null}
           

            <div className="mt-6">
              <button
                type="submit"
                disabled={Boolean(validationError) || submitting}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-55"
              >
                {submitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}
