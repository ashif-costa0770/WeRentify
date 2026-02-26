"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { logout } from "@/services/auth.service";
import { updateProfile, sendPasswordOtp } from "@/services/user.service";
import { toast } from "sonner";
import {
  Camera,
  User,
  Mail,
  Phone,
  Save,
  House,
  MessageCircle,
  Heart,
  Crown,
  Building2,
  HelpCircle,
  Settings,
  LogOut,
  Lock,
  MessageSquare,
} from "lucide-react";

const PricingModal = dynamic(() => import("@/components/modals/PricingModal"), {
  ssr: false,
});
const ChangePasswordModal = dynamic(
  () => import("@/app/profile/_modals/ChangePassword"),
  { ssr: false },
);
const AccountInfo = dynamic(
  () => import("@/app/profile/_components/AccountInfo"),
  {
    ssr: false,
  },
);
const AccountDeleteBtn = dynamic(
  () => import("@/app/profile/_components/AccountDeleteBtn"),
  {
    ssr: false,
  },
);
const Messages = dynamic(() => import("@/app/profile/_components/Messages"), {
  ssr: false,
});

const Favorites = dynamic(() => import("@/app/profile/_components/Favorites"), {
  ssr: false,
});
const MyListings = dynamic(
  () => import("@/app/profile/_components/MyListings"),
  {
    ssr: false,
  },
);
const MyPosts = dynamic(
  () => import("@/app/profile/_components/MyPosts"),
  {
    ssr: false,
  },
);

export default function AccountProfile() {
  const router = useRouter();
  const [profileImage, setProfileImage] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formValues, setFormValues] = useState({
    firstname: "",
    lastname: "",
    phone: "",
  });
  const [errors, setErrors] = useState({
    firstname: "",
    lastname: "",
    phone: "",
  });
  const [showPricing, setShowPricing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [currentPlan, setCurrentPlan] = useState("basic");

  const { user, setUser, setIsLogin, isLogin, isAuthLoading } = useUser();

  // Sync currentPlan with user context when user data changes
  useEffect(() => {
    if (user?.plan) {
      setCurrentPlan(user.plan);
      localStorage.setItem("userPlan", user.plan);
    }
  }, [user?.plan]);

  // Listen for plan-updated event from payment-success page
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePlanUpdate = (event) => {
      const newPlan = event.detail?.plan;
      if (newPlan) {
        setCurrentPlan(newPlan);
        localStorage.setItem("userPlan", newPlan);
      }
    };

    window.addEventListener("plan-updated", handlePlanUpdate);
    return () => window.removeEventListener("plan-updated", handlePlanUpdate);
  }, []);
  const fullName = `${user?.firstname || ""} ${user?.lastname || ""}`.trim();

  const displayName = fullName || "Unknown";
  const displayMode = user?.mode
    ? user.mode.charAt(0).toUpperCase() + user.mode.slice(1)
    : "Renter";
  const email = user?.email || "user@email.com";
  const displayInitial = displayName.charAt(0).toUpperCase();

  const avatarUrl = useMemo(() => {
    if (profileImage) return profileImage;
    return user?.avatar?.url || null;
  }, [profileImage, user?.avatar?.url]);

  useEffect(() => {
    setFormValues({
      firstname: user?.firstname || "",
      lastname: user?.lastname || "",
      phone: user?.phone || "",
    });
  }, [user]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file.");
        return;
      }
      setAvatarFile(file);
      setProfileImage(URL.createObjectURL(file));
    }
  };

  useEffect(() => {
    return () => {
      if (profileImage) URL.revokeObjectURL(profileImage);
    };
  }, [profileImage]);

  useEffect(() => {
    if (!isAuthLoading && !isLogin) {
      router.replace("/");
    }
  }, [isAuthLoading, isLogin, router]);

  //TODO-> Update user plan in backend
  const handlePlanSelect = (planId) => {
    setCurrentPlan(planId);
    localStorage.setItem("userPlan", planId);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setIsLogin(false);
      toast.success("Logout successfull");
      router.push("/");
    } catch (error) {
      console.log(error);
    }
  };

  const handleChangePassword = async () => {
    try {
      setIsSendingOtp(true);
      await sendPasswordOtp();
      setShowPasswordModal(true);
      toast.success("OTP sent to your registered email.");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to send OTP";
      toast.error(message);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const validateForm = () => {
    const nextErrors = { firstname: "", lastname: "", phone: "" };
    let isValid = true;

    const firstname = formValues.firstname.trim();
    const lastname = formValues.lastname.trim();
    const phone = formValues.phone.trim();

    if (!firstname) {
      nextErrors.firstname = "First name is required";
      isValid = false;
    } else if (firstname.length < 2) {
      nextErrors.firstname = "Must be at least 2 characters";
      isValid = false;
    }

    if (!lastname) {
      nextErrors.lastname = "Last name is required";
      isValid = false;
    } else if (lastname.length < 2) {
      nextErrors.lastname = "Must be at least 2 characters";
      isValid = false;
    }

    if (!phone) {
      nextErrors.phone = "Phone number is required";
      isValid = false;
    } else if (!/^\+?[0-9]{10,15}$/.test(phone)) {
      nextErrors.phone = "Use 10-15 digits, optional leading +";
      isValid = false;
    }

    setErrors(nextErrors);
    return isValid;
  };

  const handleInputChange = (field, value) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSaving(true);

      const payload = new FormData();
      payload.append("firstname", formValues.firstname.trim());
      payload.append("lastname", formValues.lastname.trim());
      payload.append("phone", formValues.phone.trim());
      if (avatarFile) {
        payload.append("avatar", avatarFile);
      }

      const res = await updateProfile(payload);
      const updatedUser = res?.data?.data;

      if (updatedUser) {
        setUser(updatedUser);
      }

      toast.success("Profile updated successfully");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to update profile";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 items-start">
          <aside className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-4 py-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-100">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={`${displayName} avatar`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-gray-600">
                      {displayInitial}
                    </span>
                  )}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-bold text-gray-900">
                    {displayName}
                  </h2>
                  <div className=" ms-[-1] flex items-center gap-1 text-sm text-gray-500">
                    <House size={14} />
                    <span>{displayMode} Mode</span>
                  </div>
                </div>
              </div>
            </div>

            <nav className="py-2 gap-2">
              <SidebarItem
                icon={<User size={16} />}
                label="Profile"
                onClick={() => setActiveSection("profile")}
                active={activeSection === "profile"}
              />
              <SidebarItem
                icon={<MessageCircle size={16} />}
                label="Messages"
                onClick={() => setActiveSection("messages")}
                active={activeSection === "messages"}
              />
              <SidebarItem
                icon={<Heart size={16} />}
                label="Favorites"
                onClick={() => setActiveSection("favorites")}
                active={activeSection === "favorites"}
              />
              <SidebarItem
                icon={<Crown size={16} />}
                label="My Listings"
                onClick={() => setActiveSection("my-listings")}
                active={activeSection === "my-listings"}
              />
               <SidebarItem
                icon={<MessageSquare size={16} />}
                label="My Posts"
                onClick={() => setActiveSection("my-posts")}
                active={activeSection === "my-posts"}
              />
            </nav>

            <div className="border-t border-gray-100" />

            <nav className="py-2 gap-2">
              <SidebarItem
                icon={<Building2 size={16} className="text-orange-500" />}
                label="Switch to Host"
                sublabel="List & earn money"
                href="/switch-host"
              />
              {/* Membership Plan - Shows Pro/Plus Member or Upgrade option */}
              <SidebarItem
                icon={
                  <Crown
                    size={16}
                    className={
                      currentPlan === "pro"
                        ? "text-purple-500"
                        : currentPlan === "plus"
                          ? "text-yellow-500"
                          : "text-gray-400"
                    }
                  />
                }
                label={
                  currentPlan === "pro"
                    ? "Pro Member"
                    : currentPlan === "plus"
                      ? "Plus Member"
                      : "Upgrade to Pro"
                }
                sublabel={
                  currentPlan !== "basic" ? "Active" : "Unlock premium features"
                }
                sublabelClassName={
                  currentPlan !== "basic" ? "text-green-600" : "text-gray-400"
                }
                onClick={() => setShowPricing(true)}
              />
              <SidebarItem
                icon={<HelpCircle size={16} />}
                label="Help Center"
                href="/help"
              />
              <SidebarItem
                icon={<Settings size={16} />}
                label="Settings"
                href="/settings"
              />
            </nav>

            <div className="border-t border-gray-100" />

            <SidebarItem
              icon={<LogOut size={16} className="text-red-500" />}
              label="Logout"
              onClick={handleLogout}
              textClassName="text-red-500 cursor-pointer"
            />
          </aside>

          <div className="space-y-6">
            {activeSection === "profile" ? (
              <>
                <main className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-8">
                  <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                    Profile Details
                  </h1>

                  <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                      <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gray-100 border border-gray-300 flex items-center justify-center overflow-hidden">
                          {avatarUrl ? (
                            <Image
                              src={avatarUrl}
                              height={80}
                              width={80}
                              alt="Profile Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <User className="w-10 h-10 text-gray-400" />
                          )}
                        </div>

                        <label className="absolute bottom-0 right-0 bg-indigo-600 p-2 rounded-full text-white cursor-pointer shadow">
                          <Camera size={12} />
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </label>
                      </div>

                      <div>
                        <p className="text-base font-medium text-gray-800">
                          Profile Photo
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Click the camera icon to upload. PNG,
                          <br className="hidden sm:block" />
                          JPG or GIF.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          First Name
                        </label>
                        <input
                          type="text"
                          placeholder="Jane"
                          value={formValues.firstname}
                          onChange={(e) =>
                            handleInputChange("firstname", e.target.value)
                          }
                          className={`mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200 ${
                            errors.firstname
                              ? "border-red-400 focus:border-red-400"
                              : "border-gray-200 focus:border-indigo-500"
                          }`}
                        />
                        {errors.firstname && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.firstname}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-700">
                          Last Name
                        </label>
                        <input
                          type="text"
                          placeholder="Doe"
                          value={formValues.lastname}
                          onChange={(e) =>
                            handleInputChange("lastname", e.target.value)
                          }
                          className={`mt-1 w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200 ${
                            errors.lastname
                              ? "border-red-400 focus:border-red-400"
                              : "border-gray-200 focus:border-indigo-500"
                          }`}
                        />
                        {errors.lastname && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.lastname}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <div className="relative mt-1">
                        <Mail
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <input
                          type="email"
                          value={email}
                          readOnly
                          className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-4 py-3 text-gray-500 italic"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <div className="relative mt-1">
                        <Phone
                          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                          size={18}
                        />
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={formValues.phone}
                          onChange={(e) =>
                            handleInputChange(
                              "phone",
                              e.target.value.replace(/[^\d+]/g, ""),
                            )
                          }
                          className={`w-full rounded-xl border pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200 ${
                            errors.phone
                              ? "border-red-400 focus:border-red-400"
                              : "border-gray-200 focus:border-indigo-500"
                          }`}
                        />
                        {errors.phone && (
                          <p className="mt-1 text-xs text-red-500">
                            {errors.phone}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 flex justify-between border-t border-gray-100">
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-white font-semibold shadow disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        <Save size={18} />
                        <span>{isSaving ? "Saving..." : "Save Changes"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleChangePassword}
                        disabled={isSendingOtp}
                        className="inline-flex cursor-pointer items-center gap-2 text-indigo-600 font-semibold disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        <Lock size={18} />
                        {isSendingOtp ? "Sending OTP..." : "Change Password"}
                      </button>
                    </div>
                  </form>
                </main>
                <AccountInfo />
                <AccountDeleteBtn />
              </>
            ) : activeSection === "messages" ? (
              <Messages />
            ) : activeSection === "favorites" ? (
              <Favorites />
            ) : activeSection === "my-listings" ? (
              <MyListings />
            ) : activeSection === "my-posts" ? (
              <MyPosts />
            ) : null}
          </div>
        </div>
      </div>
      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        currentPlan={currentPlan}
        onPlanSelect={handlePlanSelect}
      />
      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        email={email}
      />
    </div>
  );
}

function SidebarItem({
  icon,
  label,
  sublabel,
  href,
  onClick,
  active = false,
  textClassName = "",
  sublabelClassName = "text-gray-400",
}) {
  const content = (
    <>
      <span className={active ? "text-indigo-600" : "text-gray-500"}>
        {icon}
      </span>
      <div>
        <p
          className={`text-sm cursor-pointer font-medium ${
            active ? "text-indigo-600" : "text-gray-800"
          } ${textClassName}`}
        >
          {label}
        </p>
        {sublabel && (
          <p className={`text-xs ${sublabelClassName}`}>{sublabel}</p>
        )}
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="w-full flex items-center gap-3 px-5 py-3 text-left"
      >
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center gap-3 px-5 py-3 text-left"
      >
        {content}
      </button>
    );
  }

  return (
    <div className="w-full flex items-center gap-3 px-5 py-3 text-left">
      {content}
    </div>
  );
}
