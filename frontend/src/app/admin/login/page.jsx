"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "/backend-api").replace(
  /\/+$/,
  "",
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
        throw new Error(
          "Login succeeded but session cookie was not stored. Check HTTPS, FRONTEND_URL/FRONTEND_URLS, and ADMIN_COOKIE_* settings on backend.",
        );
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
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#090B12] px-4">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.2),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.18),transparent_40%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.12),transparent_45%)]" />
        <div className="relative rounded-2xl border border-white/15 bg-white/90 px-6 py-4 shadow-[0_24px_80px_rgba(2,8,23,0.45)] backdrop-blur">
          <p className="text-sm font-medium text-slate-700">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#090B12] px-4 py-12 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.22),transparent_45%),radial-gradient(circle_at_80%_0%,rgba(99,102,241,0.2),transparent_42%),radial-gradient(circle_at_50%_100%,rgba(168,85,247,0.14),transparent_46%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:40px_40px]" />

      <div className="relative mx-auto flex min-h-[calc(100vh-6rem)] w-full max-w-6xl items-center justify-center">
        <div className="hidden w-full max-w-xl pr-12 lg:block">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-slate-200">
            WeRentify Admin
          </span>
          <h1 className="mt-6 text-4xl font-semibold leading-tight text-white">
            Secure operations,
            <br />
            modern control panel.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-6 text-slate-300">
            Manage listings, services, and community content from a central
            dashboard designed for speed and clarity.
          </p>
        </div>

        <div className="w-full max-w-md rounded-3xl border border-white/15 bg-white/[0.96] p-8 text-slate-900 shadow-[0_30px_90px_rgba(2,8,23,0.55)] backdrop-blur-xl sm:p-9">
          <div className="mb-8">
            <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-sky-50 text-indigo-600">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
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
            <h2 className="text-[1.75rem] font-semibold tracking-tight text-slate-950">
              Admin login
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Enter your credentials to access the admin dashboard.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label
                htmlFor="admin-email"
                className="block text-sm font-medium text-slate-700"
              >
                Email
              </label>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@company.com"
                autoComplete="username"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 px-3 text-slate-900 placeholder:text-slate-400 outline-none transition duration-150 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="admin-password"
                className="block text-sm font-medium text-slate-700"
              >
                Password
              </label>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-slate-300 bg-slate-50 py-2.5 px-3 text-slate-900 placeholder:text-slate-400 outline-none transition duration-150 focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10"
              />
            </div>

            {error ? (
              <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="w-full cursor-pointer   rounded-xl bg-slate-900 py-2.5 font-medium text-white shadow-[0_14px_28px_rgba(15,23,42,0.28)] transition duration-150 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-55"
            >
              {isSubmitting ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
