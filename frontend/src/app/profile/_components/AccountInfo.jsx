import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import { facebookAuth, getMe, logout } from "@/services/auth.service";
import { loginWithFacebook } from "@/utils/facebookLogin";

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

const getActiveConnections = (user) => {
  if (user?.lastLoginProvider === "google") {
    return { google: true, facebook: false };
  }

  if (user?.lastLoginProvider === "facebook") {
    return { google: false, facebook: true };
  }

  return {
    google: !!user?.googleId && !user?.facebookId,
    facebook: !!user?.facebookId && !user?.googleId,
  };
};

export default function SocialLoginSettings() {
  const { user, setUser, setIsLogin } = useUser();
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const activeConnections = getActiveConnections(user);
  const [connections, setConnections] = useState({
    google: activeConnections.google,
    facebook: activeConnections.facebook,
    apple: false,
  });

  useEffect(() => {
    setConnections((prev) => ({
      ...prev,
      google: activeConnections.google,
      facebook: activeConnections.facebook,
    }));
  }, [activeConnections.facebook, activeConnections.google]);

  const maskedGoogleEmail = useMemo(() => maskEmail(user?.email), [user?.email]);
  const maskedFacebookEmail = useMemo(() => maskEmail(user?.email), [user?.email]);

  const disconnectCurrentUser = async (provider) => {
    try {
      if (provider === "facebook") {
        setIsFacebookLoading(true);
      } else {
        setIsGoogleLoading(true);
      }
      await logout();
      toast.success("Logged out successfully");
      setUser(null);
      setIsLogin(false);
      setConnections((prev) => ({ ...prev, google: false, facebook: false }));
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to log out";
      toast.error(message);
    } finally {
      if (provider === "facebook") {
        setIsFacebookLoading(false);
      } else {
        setIsGoogleLoading(false);
      }
    }
  };

  const handleGoogleToggle = async () => {
    if (connections.google) {
      await disconnectCurrentUser("google");
      return;
    }

    const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "/backend-api").replace(/\/+$/, "");
    window.location.href = `${apiUrl}/auth/google`;
  };

  const handleFacebookToggle = async () => {
    if (connections.facebook) {
      await disconnectCurrentUser("facebook");
      return;
    }

    try {
      setIsFacebookLoading(true);
      const accessToken = await loginWithFacebook({ forceDialog: true });
      await facebookAuth(accessToken);

      const profileRes = await getMe();
      if (profileRes?.data?.success && profileRes?.data?.data) {
        setUser(profileRes.data.data);
      }

      setIsLogin(true);
      setConnections((prev) => ({ ...prev, google: false, facebook: true }));
      toast.success("Facebook login successful");
    } catch (error) {
      if (error?.message === "FACEBOOK_LOGIN_CANCELLED") {
        toast.info("Facebook login cancelled");
        return;
      }

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Facebook login failed";
      toast.error(message);
    } finally {
      setIsFacebookLoading(false);
    }
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
              ? `You've set up login with your Facebook account (${maskedFacebookEmail}).`
              : "Not connected. You can choose to log in with Facebook."
          }
          isConnected={connections.facebook}
          onToggle={handleFacebookToggle}
          isLoading={isFacebookLoading}
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
    </div>
  );
}
