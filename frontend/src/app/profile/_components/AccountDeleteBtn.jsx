"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import { deleteAccount } from "@/services/user.service";

export default function AccountDeleteBtn() {
  const router = useRouter();
  const { setUser, setIsLogin } = useUser();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteAccount();
      toast.success("Account deleted successfully");
      setUser(null);
      setIsLogin(false);
      setShowConfirm(false);
      router.push("/");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to delete account";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div className="w-full rounded-2xl border border-red-200 shadow-sm bg-red-50 p-4 sm:p-8">
        <h3 className="text-lg font-semibold text-red-700">Danger Zone</h3>
        <p className="mt-2 text-sm text-red-600">
          Once you delete your account, all your data including items, services,
          and posts will be permanently removed.
        </p>
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white cursor-pointer hover:bg-red-700"
        >
          Delete Account
        </button>
      </div>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">
              Confirm Delete
            </h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure? This action cannot be undone and will permanently
              delete your account and all associated data.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-50 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white cursor-pointer hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
