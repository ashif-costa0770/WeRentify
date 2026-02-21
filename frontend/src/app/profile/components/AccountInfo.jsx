import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import { deleteAccount } from "@/services/user.service";

const AuthMethodRow = ({ title, description, isConnected, onToggle, isLoading = false }) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between py-6 border-b border-gray-100 last:border-0">
      <div className="mb-4 md:mb-0">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <button
        onClick={onToggle}
        disabled={isLoading}
        className="px-8 py-2 min-w-[140px] cursor-pointer border border-green-600 text-green-700 font-medium rounded-lg hover:bg-green-50 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isLoading ? "Please wait..." : isConnected ? "Disconnect" : "Connect"}
      </button>
    </div>
  );
};

const maskEmail = (email) => {
  if (!email || !email.includes("@")) return "";
  const [localPart, domain] = email.split("@");

  if (localPart.length <= 2) {
    return `${localPart.charAt(0)}*@${domain}`;
  }

  const firstChar = localPart.charAt(0);
  const lastTwo = localPart.slice(-2);
  const stars = "*".repeat(Math.max(localPart.length - 3, 3));
  return `${firstChar}${stars}${lastTwo}@${domain}`;
};

export default function SocialLoginSettings() {
  const { user, setUser, setIsLogin } = useUser();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [connections, setConnections] = useState({
    google: !!user?.googleId,
    facebook: false,
    apple: false,
  });

  useEffect(() => {
    setConnections((prev) => ({ ...prev, google: !!user?.googleId }));
  }, [user?.googleId]);

  const maskedGoogleEmail = useMemo(() => maskEmail(user?.email), [user?.email]);

  const confirmDisconnect = async () => {
    try {
      setIsGoogleLoading(true);
      await deleteAccount();
      toast.success("Google account deleted");
      setUser(null);
      setIsLogin(false);
      setConnections((prev) => ({ ...prev, google: false }));
      setShowDisconnectConfirm(false);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to disconnect account";
      toast.error(message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleToggle = async () => {
    if (connections.google) {
      setShowDisconnectConfirm(true);
      return;
    }

    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "/backend-api").replace(/\/+$/, "");
    window.location.href = `${apiUrl}/auth/google`;
  };

  return (
    <div className="w-full rounded-2xl border border-gray-200 shadow-sm bg-white p-4 sm:p-8">
      <div className="space-y-2">
        <AuthMethodRow
          title="Log in with Google"
          description={
            connections.google
              ? `You've set up login with your Google account (${maskedGoogleEmail}).`
              : "Not connected. You can choose to log in with Google."
          }
          isConnected={connections.google}
          onToggle={handleGoogleToggle}
          isLoading={isGoogleLoading}
        />

        <AuthMethodRow
          title="Log in with Facebook"
          description={
            connections.facebook
              ? "You've set up login with your Facebook account."
              : "Not connected. You can choose to log in with Facebook."
          }
          isConnected={connections.facebook}
          onToggle={() => setConnections((prev) => ({ ...prev, facebook: !prev.facebook }))}
        />

        <AuthMethodRow
          title="Log in with Apple"
          description={
            connections.apple
              ? "You've set up login with your Apple ID."
              : "Not connected. You can choose to log in with Apple."
          }
          isConnected={connections.apple}
          onToggle={() => setConnections((prev) => ({ ...prev, apple: !prev.apple }))}
        />
      </div>

      {showDisconnectConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900">Confirm Disconnect</h3>
            <p className="mt-2 text-sm text-gray-600">
              Are you sure? This will permanently delete your account and all your data including Items, Services, Posts etc.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDisconnectConfirm(false)}
                disabled={isGoogleLoading}
                className="rounded-lg border cursor-pointer border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDisconnect}
                disabled={isGoogleLoading}
                className="rounded-lg bg-red-600 px-4 cursor-pointer py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isGoogleLoading ? "Disconnecting..." : "Disconnect"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
