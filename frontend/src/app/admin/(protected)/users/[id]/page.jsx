"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "/backend-api").replace(
  /\/+$/,
  ""
);

function formatDate(dateValue) {
  if (!dateValue) return "N/A";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "N/A";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getInitials(firstName, lastName) {
  const first = (firstName || "").trim().charAt(0);
  const last = (lastName || "").trim().charAt(0);
  const initials = `${first}${last}`.toUpperCase();
  return initials || "U";
}

function getPlanBadgeClass(planName) {
  const value = (planName || "Basic").toLowerCase();
  if (value === "pro") return "bg-indigo-100 text-indigo-700";
  if (value === "plus") return "bg-purple-100 text-purple-700";
  return "bg-gray-100 text-gray-700";
}

function formatPlanPrice(price, currency) {
  if (price == null || Number.isNaN(Number(price))) return "N/A";
  const normalizedCurrency = String(currency || "inr").toLowerCase();
  const symbol = normalizedCurrency === "usd" ? "$" : "₹";
  return `${symbol}${Number(price).toLocaleString("en-IN")}`;
}

function normalizeProvider(provider) {
  const value = String(provider || "local").toLowerCase();
  if (value === "google") return "Google";
  if (value === "facebook") return "Facebook";
  return "Local";
}

function getTypeBadgeClass(type) {
  const value = String(type || "").toLowerCase();
  if (value === "listing") return "bg-blue-100 text-blue-700 ring-1 ring-blue-200";
  if (value === "service") return "bg-teal-100 text-teal-700 ring-1 ring-teal-200";
  if (value === "post") return "bg-violet-100 text-violet-700 ring-1 ring-violet-200";
  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

function getStatusBadgeClass(status) {
  const value = String(status || "").toLowerCase();
  if (value === "active" || value === "published") {
    return "bg-emerald-100 text-emerald-700 ring-1 ring-emerald-200";
  }
  if (value === "inactive" || value === "suspended") {
    return "bg-rose-100 text-rose-700 ring-1 ring-rose-200";
  }
  if (value === "under_maintenance") {
    return "bg-amber-100 text-amber-700 ring-1 ring-amber-200";
  }
  return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params?.id;

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [recentContent, setRecentContent] = useState([]);
  const [stats, setStats] = useState({
    listingsCount: 0,
    servicesCount: 0,
    postsCount: 0,
    commentsCount: 0,
  });
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    async function fetchUserDetails() {
      setLoading(true);
      setNotFound(false);
      setError("");

      try {
        const res = await fetch(`${API_URL}/admin/users/${userId}`, {
          credentials: "include",
          cache: "no-store",
        });
        const payload = await res.json().catch(() => null);

        if (!res.ok || !payload?.success || !payload?.data?.user) {
          if (!cancelled) {
            if (res.status === 404) {
              setNotFound(true);
            } else {
              setError(payload?.message || "Failed to load user details");
            }
          }
          return;
        }

        if (cancelled) return;

        setUserData(payload.data.user);
        setRecentContent(Array.isArray(payload?.data?.recentContent) ? payload.data.recentContent : []);
        setStats({
          listingsCount: payload?.data?.stats?.listingsCount ?? 0,
          servicesCount: payload?.data?.stats?.servicesCount ?? 0,
          postsCount: payload?.data?.stats?.postsCount ?? 0,
          commentsCount: payload?.data?.stats?.commentsCount ?? 0,
        });
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError?.message || "Failed to load user details");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchUserDetails();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const firstName = userData?.firstName || userData?.firstname || "";
  const lastName = userData?.lastName || userData?.lastname || "";
  const fullName = `${firstName} ${lastName}`.trim() || "Unnamed User";
  const planName = userData?.plan?.name || userData?.plan || "Basic";
  const isActive = Boolean(userData?.isActive);
  const role = userData?.role || "User";
  const provider = normalizeProvider(userData?.provider || userData?.lastLoginProvider);
  const avatarUrl = userData?.avatar?.url || "";
  const planCurrency = userData?.plan?.currency || "inr";

  const statCards = useMemo(
    () => [
      { label: "Total Listings", value: stats.listingsCount },
      { label: "Total Services", value: stats.servicesCount },
      { label: "Total Posts", value: stats.postsCount },
      { label: "Total Comments", value: stats.commentsCount },
    ],
    [stats]
  );

  const handleSuspendActivate = async () => {
    if (!userId || !userData) return;
    setActionLoading(true);
    setError("");
    setNotice("");

    const nextIsActive = !Boolean(userData?.isActive);
    setUserData((prev) => (prev ? { ...prev, isActive: nextIsActive } : prev));

    try {
      const endpoint = nextIsActive ? "activate" : "deactivate";
      const res = await fetch(`${API_URL}/admin/users/${userId}/${endpoint}`, {
        method: "PATCH",
        credentials: "include",
        cache: "no-store",
      });
      const payload = await res.json().catch(() => null);

      if (!res.ok || !payload?.success) {
        throw new Error(payload?.message || "Failed to update user status");
      }

      setNotice(nextIsActive ? "User activated successfully." : "User suspended successfully.");
    } catch (actionError) {
      setUserData((prev) => (prev ? { ...prev, isActive: !nextIsActive } : prev));
      setError(actionError?.message || "Failed to update user status");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userId) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete this user? This action cannot be undone."
    );
    if (!confirmed) return;

    setActionLoading(true);
    setError("");
    setNotice("");

    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
      });
      const payload = await res.json().catch(() => null);

      if (!res.ok || !payload?.success) {
        throw new Error(payload?.message || "Failed to delete user");
      }

      router.replace("/admin/users");
    } catch (actionError) {
      setError(actionError?.message || "Failed to delete user");
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center">
        <p className="text-slate-500">Loading user details...</p>
      </section>
    );
  }

  if (notFound || !userData) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center">
        <p className="text-slate-500 text-lg font-medium">User not found</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {notice ? (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
          {notice}
        </div>
      ) : null}

      <div className="bg-white rounded-xl shadow-md p-6 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div className="flex items-center gap-4">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={`${fullName} avatar`}
              width={68}
              height={68}
              className="h-20 w-20 rounded-full object-cover border border-slate-200"
            />
          ) : (
            <div className="h-16 w-16 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xl font-bold">
              {getInitials(firstName, lastName)}
            </div>
          )}

          <div>
            <h1 className="text-2xl font-bold text-slate-900">{fullName}</h1>
            <p className="text-sm text-slate-500 mt-0.5">{userData?.email || "N/A"}</p>
            <p className="text-xs text-slate-500 mt-1">
              Joined: {formatDate(userData?.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex px-4 py-1.5 rounded-full text-sm font-semibold ${
              isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
            }`}
          >
            {isActive ? "Active" : "Suspended"}
          </span>
          <span
            className={`inline-flex px-4 py-1.5 rounded-full text-sm font-semibold ${getPlanBadgeClass(
              planName
            )}`}
          >
            {planName}
          </span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Plan Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Plan Name</p>
            <p className="mt-1 font-medium text-slate-800">{String(planName)}</p>
          </div>
          <div>
            <p className="text-slate-500">Plan Price</p>
            <p className="mt-1 font-medium text-slate-800">
              {formatPlanPrice(userData?.plan?.price, planCurrency)}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Role</p>
            <p className="mt-1 font-medium text-slate-800">{role}</p>
          </div>
          <div>
            <p className="text-slate-500">Provider</p>
            <p className="mt-1 font-medium text-slate-800">{provider}</p>
          </div>
          <div>
            <p className="text-slate-500">Email Verified</p>
            <span
              className={`inline-flex mt-1 px-3 py-1 rounded-full text-xs font-medium ${
                userData?.isVerified
                  ? "bg-green-100 text-green-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {userData?.isVerified ? "Yes" : "No"}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl shadow-md p-6 transition-transform duration-200 hover:-translate-y-0.5"
          >
            <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">
              {card.label}
            </p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Recent Content</h2>
        <div className="overflow-x-auto rounded-lg border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {recentContent.length > 0 ? (
                recentContent.map((item) => (
                  <tr key={item.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 text-sm font-semibold text-slate-700">{item.title}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getTypeBadgeClass(
                          item.type
                        )}`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusBadgeClass(
                          item.status
                        )}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {formatDate(item.createdAt)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-sm text-slate-500"
                  >
                    No recent activity
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-red-200 bg-gradient-to-r from-red-50 to-rose-50 p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 h-8 w-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4">
              <path
                d="M12 3 2 21h20L12 3Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinejoin="round"
              />
              <path
                d="M12 9v5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <circle cx="12" cy="17.5" r="1" fill="currentColor" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-red-700">Danger Zone</h2>
            <p className="text-sm text-red-700/80 mt-1">
              These actions are sensitive. Please confirm before proceeding.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleSuspendActivate}
            disabled={actionLoading}
            className={`px-4 py-2.5 rounded-lg text-sm font-medium text-white cursor-pointer shadow-sm disabled:opacity-60 disabled:cursor-not-allowed ${
              isActive
                ? "bg-red-500 hover:bg-red-600 focus:ring-2 focus:ring-red-200"
                : "bg-green-500 hover:bg-green-600 focus:ring-2 focus:ring-green-200"
            }`}
          >
            {actionLoading ? "Updating..." : isActive ? "Suspend" : "Activate"}
          </button>

          <button
            type="button"
            onClick={handleDeleteUser}
            disabled={actionLoading}
            className="px-4 py-2.5 rounded-lg text-sm font-medium bg-slate-900 text-white hover:bg-black cursor-pointer shadow-sm focus:ring-2 focus:ring-slate-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {actionLoading ? "Processing..." : "Delete User"}
          </button>
        </div>
      </div>
    </section>
  );
}
