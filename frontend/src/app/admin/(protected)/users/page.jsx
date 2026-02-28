"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "/backend-api").replace(
  /\/+$/,
  ""
);

function formatDate(dateValue) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getPlanBadgeClass(plan) {
  const normalizedPlan = (plan || "Basic").toLowerCase();
  if (normalizedPlan === "pro") return "bg-indigo-100 text-indigo-700";
  if (normalizedPlan === "plus") return "bg-purple-100 text-purple-700";
  return "bg-gray-100 text-gray-700";
}

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [openActionId, setOpenActionId] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
  });

  useEffect(() => {
    let cancelled = false;

    async function fetchUsers() {
      setLoading(true);
      setError("");

      try {
        const url = `${API_URL}/admin/users?page=${page}`;
        const res = await fetch(url, {
          credentials: "include",
          cache: "no-store",
        });
        const payload = await res.json().catch(() => null);

        if (!res.ok || !payload?.success) {
          throw new Error(payload?.message || "Failed to fetch users");
        }

        if (cancelled) return;

        setUsers(Array.isArray(payload?.data) ? payload.data : []);
        setPagination({
          total: payload?.pagination?.total ?? 0,
          page: payload?.pagination?.page ?? page,
          pages: Math.max(payload?.pagination?.pages ?? 1, 1),
        });
      } catch (fetchError) {
        if (!cancelled) {
          setUsers([]);
          setError(fetchError.message || "Failed to fetch users");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchUsers();
    return () => {
      cancelled = true;
    };
  }, [page]);

  const canGoPrevious = page > 1;
  const canGoNext = page < (pagination.pages || 1);

  const uiUsers = useMemo(() => users, [users]);

  const handleToggleUserStatus = async (userId, isCurrentlyActive) => {
    const nextIsActive = !isCurrentlyActive;
    const endpoint = nextIsActive ? "activate" : "deactivate";

    setError("");
    setOpenActionId(null);
    setActionLoadingId(userId);

    // Optimistic update for instant UI feedback.
    setUsers((prev) =>
      prev.map((user) =>
        user?._id === userId ? { ...user, isActive: nextIsActive } : user
      )
    );

    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}/${endpoint}`, {
        method: "PATCH",
        credentials: "include",
        cache: "no-store",
      });
      const payload = await res.json().catch(() => null);

      if (!res.ok || !payload?.success) {
        throw new Error(payload?.message || "Failed to update user status");
      }
    } catch (actionError) {
      // Revert optimistic update on failure.
      setUsers((prev) =>
        prev.map((user) =>
          user?._id === userId ? { ...user, isActive: isCurrentlyActive } : user
        )
      );
      setError(actionError.message || "Failed to update user status");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDeleteUser = async (userId) => {
    const previousUsers = users;
    const previousPagination = pagination;
    const removedUser = previousUsers.find((user) => user?._id === userId);
    if (!removedUser) return;

    setError("");
    setOpenActionId(null);
    setActionLoadingId(userId);

    // Optimistic removal for instant UI update.
    setUsers((prev) => prev.filter((user) => user?._id !== userId));
    setPagination((prev) => ({
      ...prev,
      total: Math.max((prev?.total ?? 0) - 1, 0),
    }));

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
    } catch (actionError) {
      // Revert optimistic delete on failure.
      setUsers(previousUsers);
      setPagination(previousPagination);
      setError(actionError.message || "Failed to delete user");
    } finally {
      setActionLoadingId(null);
    }
  };

  useEffect(() => {
    if (!openActionId) return;

    const handleOutsideClick = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!target.closest('[data-actions-root="true"]')) {
        setOpenActionId(null);
      }
    };

    document.addEventListener("click", handleOutsideClick);
    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [openActionId]);

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Users</h1>
          <p className="mt-1 text-sm text-slate-500">Manage platform users</p>
        </div>
        <input
          type="text"
          placeholder="Search users..."
          className="w-full sm:w-72 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-200"
        />
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="px-6 py-14 text-center text-slate-500">Loading users...</div>
        ) : uiUsers.length === 0 ? (
          <div className="px-6 py-14 text-center text-slate-500">No users found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Name
                  </th>
                  <th className="pl-6 pr-3 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Email
                  </th>
                  <th className="pl-3 pr-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Plan
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {uiUsers.map((user) => {
                  const fullName =
                    user?.fullName ||
                    `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
                    "Unnamed";
                  const isActive = Boolean(user?.isActive);
                  const plan = user?.plan || "Basic";
                  const isActionLoading = actionLoadingId === user?._id;

                  return (
                    <tr key={user?._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <Link
                          href={`/admin/users/${user?._id}`}
                          className="text-sm text-indigo-700 hover:text-indigo-800 hover:underline font-semibold cursor-pointer"
                        >
                          {fullName}
                        </Link>
                      </td>
                      <td className="pl-6 pr-3 py-4 text-sm text-gray-500">{user?.email || "-"}</td>
                      <td className="pl-3 pr-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${getPlanBadgeClass(
                            plan
                          )}`}
                        >
                          {String(plan)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            isActive
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {isActive ? "Active" : "Suspended"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-500">
                        {formatDate(user?.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative inline-block" data-actions-root="true">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenActionId((prev) => (prev === user?._id ? null : user?._id))
                            }
                            className="h-8 w-8 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-100 cursor-pointer"
                            aria-label="Open actions menu"
                          >
                            ⋮
                          </button>

                          {openActionId === user?._id ? (
                            <div className="absolute right-0 top-10 z-10 w-36 rounded-lg border border-slate-200 bg-white shadow-lg py-1">
                              <Link
                                href={`/admin/users/${user?._id}`}
                                className="block px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
                                onClick={() => setOpenActionId(null)}
                              >
                                View
                              </Link>
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleUserStatus(user?._id, isActive)
                                }
                                disabled={isActionLoading}
                                className={`block w-full text-left px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                                  isActive ? "text-red-600" : "text-green-600"
                                }`}
                              >
                                {isActionLoading
                                  ? "Updating..."
                                  : isActive
                                  ? "Deactivate"
                                  : "Activate"}
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteUser(user?._id)}
                                disabled={isActionLoading}
                                className="block w-full text-left px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 hover:text-red-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isActionLoading ? "Deleting..." : "Delete"}
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between rounded-xl bg-white shadow-md px-4 py-3">
        <p className="text-sm text-slate-600">
          Page {pagination.page || page} of {pagination.pages || 1}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={!canGoPrevious || loading}
            className="px-3 py-1.5 rounded-md border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            type="button"
            onClick={() =>
              setPage((prev) => Math.min(prev + 1, pagination.pages || prev + 1))
            }
            disabled={!canGoNext || loading}
            className="px-3 py-1.5 rounded-md border border-slate-300 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
}
