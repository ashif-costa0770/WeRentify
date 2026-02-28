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

      router.replace("/admin/dashboard");
    } catch (submitError) {
      setError(submitError.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen relative overflow-hidden bg-slate-950 px-4 flex items-center justify-center">
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-indigo-500/30 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div className="relative rounded-2xl border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-xl">
          <p className="text-slate-200">Checking session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950 px-4 py-10 flex items-center justify-center">
      <div className="absolute -top-28 -left-24 h-80 w-80 rounded-full bg-indigo-500/30 blur-3xl" />
      <div className="absolute -bottom-28 -right-24 h-80 w-80 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_40%)]" />

      <div className="relative w-full max-w-md rounded-2xl border border-white/15 bg-white/10 p-7 shadow-2xl backdrop-blur-xl">
        <div className="mb-7">
          <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium tracking-wide text-slate-100">
            WE RENTIFY ADMIN
          </span>
          <h1 className="mt-4 text-3xl font-semibold text-white">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-300">
            Sign in to continue to your admin dashboard.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="admin-email"
              className="mb-1.5 block text-sm font-medium text-slate-200"
            >
              Email
            </label>
            <div className="relative">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              >
                <path
                  d="M4 6h16v12H4z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <path
                  d="m5 7 7 6 7-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
              </svg>
              <input
                id="admin-email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="admin@example.com"
                autoComplete="username"
                className="w-full rounded-xl border border-white/20 bg-black/20 py-2.5 pl-10 pr-3 text-slate-100 placeholder:text-slate-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="mb-1.5 block text-sm font-medium text-slate-200"
            >
              Password
            </label>
            <div className="relative">
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
              >
                <path
                  d="M7 11V8a5 5 0 1 1 10 0v3"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
                <rect
                  x="5"
                  y="11"
                  width="14"
                  height="10"
                  rx="2"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />
              </svg>
              <input
                id="admin-password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter password"
                autoComplete="current-password"
                className="w-full rounded-xl border border-white/20 bg-black/20 py-2.5 pl-10 pr-3 text-slate-100 placeholder:text-slate-400 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/40"
              />
            </div>
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
