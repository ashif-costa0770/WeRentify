"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "/backend-api").replace(
  /\/+$/,
  ""
);

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const isFormValid = useMemo(() => {
    return /\S+@\S+\.\S+/.test(email.trim()) && password.trim().length > 0;
  }, [email, password]);

  useEffect(() => {
    let cancelled = false;

    async function checkExistingSession() {
      try {
        const res = await fetch(`${API_URL}/admin/me`, {
          credentials: "include",
          cache: "no-store",
        });

        if (cancelled) return;

        if (res.ok) {
          router.replace("/admin/dashboard");
          return;
        }
      } catch {
        // Keep user on login page when session check fails.
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    }

    checkExistingSession();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isFormValid || isSubmitting) return;

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const payload = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(payload?.message || "Admin login failed");
      }

      // Confirm cookie-backed session before routing to protected pages.
      const sessionRes = await fetch(`${API_URL}/admin/me`, {
        credentials: "include",
        cache: "no-store",
      });

      if (!sessionRes.ok) {
        throw new Error("Login succeeded but session cookie was not stored.");
      }

      router.replace("/admin/dashboard");
    } catch (submitError) {
      setError(submitError.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-slate-100 px-4 flex items-center justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-[0_20px_50px_rgba(15,23,42,0.12)]">
          <p className="text-slate-600">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 px-4 py-10 flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.16)]">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-7 w-7"
            >
              <path
                d="M7 10V8a5 5 0 1 1 10 0v2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <rect
                x="5"
                y="10"
                width="14"
                height="10"
                rx="2"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-semibold text-slate-900">Admin Login</h1>
          <p className="mt-2 text-sm text-slate-600">
            Sign in to securely access your admin dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="admin-email"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Email
            </label>
            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="📧 admin@example.com"
              autoComplete="username"
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="🔒 Enter password"
              autoComplete="current-password"
              className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          {error ? (
            <p className="rounded-lg border border-red-400/30 bg-red-500/10 px-3 py-2 text-sm text-red-200">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={!isFormValid || isSubmitting}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-fuchsia-500 py-2.5 font-medium text-white shadow-lg shadow-indigo-900/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
