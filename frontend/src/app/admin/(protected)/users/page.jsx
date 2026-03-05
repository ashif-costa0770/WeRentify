"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import UsersTable from "./components/users-table";
import { getUsersColumns } from "./components/users-columns";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "/backend-api").replace(
  /\/+$/,
  ""
);

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
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

  const currentPage = pagination.page || page;
  const totalPages = pagination.pages || 1;
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handleToggleUserStatus = async (userId, isCurrentlyActive) => {
    const nextIsActive = !isCurrentlyActive;
    const endpoint = nextIsActive ? "activate" : "deactivate";

    setError("");
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
      toast.success(nextIsActive ? "User activated successfully." : "User deactivated successfully.");
    } catch (actionError) {
      // Revert optimistic update on failure.
      setUsers((prev) =>
        prev.map((user) =>
          user?._id === userId ? { ...user, isActive: isCurrentlyActive } : user
        )
      );
      setError(actionError.message || "Failed to update user status");
      toast.error(actionError.message || "Failed to update user status");
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
      toast.success("User deleted successfully.");
    } catch (actionError) {
      // Revert optimistic delete on failure.
      setUsers(previousUsers);
      setPagination(previousPagination);
      setError(actionError.message || "Failed to delete user");
      toast.error(actionError.message || "Failed to delete user");
    } finally {
      setActionLoadingId(null);
    }
  };

  const columns = getUsersColumns({
    onToggleStatus: handleToggleUserStatus,
    onDelete: handleDeleteUser,
    actionLoadingId,
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Users</h1>
        <p className="mt-1 text-sm text-slate-500">Manage platform users</p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <UsersTable
        columns={columns}
        data={users}
        loading={loading}
        currentPage={currentPage}
        totalPages={totalPages}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        onPreviousPage={() => setPage((prev) => Math.max(prev - 1, 1))}
        onNextPage={() =>
          setPage((prev) => Math.min(prev + 1, pagination.pages || prev + 1))
        }
      />
    </section>
  );
}
