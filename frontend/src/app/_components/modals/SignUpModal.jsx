"use client";

import { useState } from "react";
import EmailSignUpModal from "./EmailSignUpModal";
import { loginWithFacebook } from "@/utils/facebookLogin";
import { facebookAuth } from "@/services/auth.service";
import { toast } from "sonner";

const GOOGLE_AUTH_INTENT_KEY = "google_auth_intent";

export default function SignUpModal({
  open,
  onClose,
  onSwitchToSignIn,
  setIsLogin,
}) {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignup = () => {
    if (loading) return;
    setLoading(true);
    onClose();

    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(GOOGLE_AUTH_INTENT_KEY, "signup");
    }

    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  };

  //! Handle facebook login
  const handleFacebookSignIn = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const accessToken = await loginWithFacebook({ forceDialog: true });
      await facebookAuth(accessToken);
      toast.success("Facebook sign up successfull");
      setIsLogin(true);
      onClose();
    } catch (error) {
      if (error?.message === "FACEBOOK_LOGIN_CANCELLED") {
        toast.info("Facebook sign up cancelled");
        return;
      }
      console.error("FB LOGIN ERROR:", error);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Facebook sign up failed";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[10000] p-4">
        <div className="relative max-w-lg w-full bg-white rounded-3xl shadow-2xl p-8 animate-slideUp">
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute cursor-pointer top-6 right-6 text-gray-400 hover:text-gray-600"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* Title */}
          <h2 className="text-3xl font-black text-gray-900 mb-2">
            Create account
          </h2>

          <p className="text-gray-600 mb-8">
            Join WeRentify to start renting and earning
          </p>

          {/* Buttons */}
          <div className="space-y-3">
            {/* Email */}
            <button
              onClick={() => setShowEmailModal(true)}
              className="w-full cursor-pointer flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m2 7 10 6 10-6" />
              </svg>
              Sign up with email
            </button>

            {/* Google */}
            <button
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full cursor-pointer flex items-center justify-center gap-3 px-4 py-3 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50"
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.26 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.55 1.18 5.07l2.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.2 1.66l3.15-3.15C17.45 1.99 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l2.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
                />
              </svg>
              Sign up with Google
            </button>

            {/* Facebook */}
            <button
              onClick={handleFacebookSignIn}
              disabled={loading}
              className="w-full cursor-pointer flex items-center justify-center gap-3 px-4 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M22.675 0h-21.35C.6 0 0 .6 0 1.326v21.348C0 23.4.6 24 1.326 24h11.495v-9.294H9.691V11.41h3.13V8.797c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24h-1.918c-1.505 0-1.796.715-1.796 1.763v2.312h3.587l-.467 3.296h-3.12V24h6.116C23.4 24 24 23.4 24 22.674V1.326C24 .6 23.4 0 22.675 0z" />
              </svg>
              Sign up with Facebook
            </button>
          </div>

      

          {/* Footer */}
          <p className="text-sm text-gray-600 mt-6 text-center">
            Already have an account?{" "}
            <span
              onClick={onSwitchToSignIn}
              className="text-indigo-600 font-bold cursor-pointer"
            >
              Log in
            </span>
          </p>
        </div>
      </div>

      {/* Email Sign Up Modal */}
      <EmailSignUpModal
        open={showEmailModal}
        onClose={() => {
          setShowEmailModal(false);
          onClose();
        }}
        onSwitchToSignIn={() => {
          setShowEmailModal(false);
          onSwitchToSignIn();
        }}
        setIsLogin={setIsLogin}
      />
    </>
  );
}
