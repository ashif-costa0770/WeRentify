"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import Navbar from "@/app/_components/navbar/Navbar";
import { ListBusinessProvider } from "@/context/ListBusinessContext";
import { useUser } from "@/context/UserContext";
import { logout } from "@/services/auth.service";
import { toast } from "sonner";
import {
  House,
  MessageCircle,
  Heart,
  Crown,
  Building2,
  HelpCircle,
  Settings,
  LogOut,
  User,
  MessageSquare,
  CalendarCheck,
} from "lucide-react";

const PricingModal = dynamic(
  () => import("@/app/_components/modals/PricingModal"),
  {
    ssr: false,
  },
);

export default function ProfileLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showPricing, setShowPricing] = useState(false);
  const [currentPlan, setCurrentPlan] = useState("");
  const [currentPlanName, setCurrentPlanName] = useState("");
  const { user, setUser, setIsLogin } = useUser();

  const extractPlanId = (planValue) => {
    if (!planValue) return "";
    if (typeof planValue === "string") return planValue;
    if (typeof planValue === "object")
      return planValue._id || planValue.id || "";
    return "";
  };

  const extractPlanName = (planValue) => {
    if (!planValue || typeof planValue === "string") return "";
    return planValue?.name || "";
  };

  useEffect(() => {
    if (user?.plan) {
      const planId = extractPlanId(user.plan);
      const planName = extractPlanName(user.plan);

      setCurrentPlan(planId);
      setCurrentPlanName(planName);
      localStorage.setItem("userPlan", planId);
    }
  }, [user?.plan]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handlePlanUpdate = (event) => {
      const newPlan = event.detail?.plan;
      if (newPlan) {
        const planId = extractPlanId(newPlan) || String(newPlan);
        setCurrentPlan(planId);
        localStorage.setItem("userPlan", planId);
      }
    };

    window.addEventListener("plan-updated", handlePlanUpdate);
    return () => window.removeEventListener("plan-updated", handlePlanUpdate);
  }, []);

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

  const fullName = `${user?.firstname || ""} ${user?.lastname || ""}`.trim();
  const displayName = fullName || "Unknown";
  const displayMode = user?.mode
    ? user.mode.charAt(0).toUpperCase() + user.mode.slice(1)
    : "Renter";
  const displayInitial = displayName.charAt(0).toUpperCase();
  const avatarUrl = useMemo(() => user?.avatar?.url || null, [user?.avatar?.url]);
  const normalizedPlanName = currentPlanName.toLowerCase();
  const isProPlan = normalizedPlanName === "pro";
  const isPlusPlan = normalizedPlanName === "plus";
  const isBasicPlan = normalizedPlanName === "basic" || !normalizedPlanName;

  return (
    <ListBusinessProvider>
      <div className="sticky top-0 z-50 bg-gray-100 pb-4 shadow-lg">
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
      </div>
      <div className="min-h-screen bg-gray-100 overflow-x-hidden">
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
                  href="/profile"
                  active={pathname === "/profile"}
                />
                <SidebarItem
                  icon={<MessageCircle size={16} />}
                  label="Messages"
                  href="/profile/messages"
                  active={pathname === "/profile/messages"}
                />
                <SidebarItem
                  icon={<Heart size={16} />}
                  label="Favorites"
                  href="/profile/favorites"
                  active={pathname === "/profile/favorites"}
                />
                <SidebarItem
                  icon={<Crown size={16} />}
                  label="My Listings"
                  href="/profile/listings"
                  active={pathname === "/profile/listings"}
                />
                <SidebarItem
                  icon={<MessageSquare size={16} />}
                  label="My Posts"
                  href="/profile/posts"
                  active={pathname === "/profile/posts"}
                />
                <SidebarItem
                  icon={<CalendarCheck size={16} />}
                  label="My Bookings"
                  href="/profile/bookings"
                  active={pathname === "/profile/bookings"}
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
                <SidebarItem
                  icon={
                    <Crown
                      size={16}
                      className={
                        isProPlan
                          ? "text-purple-500"
                          : isPlusPlan
                            ? "text-yellow-500"
                            : "text-gray-400"
                      }
                    />
                  }
                  label={
                    isProPlan
                      ? "Pro Member"
                      : isPlusPlan
                        ? "Plus Member"
                        : "Upgrade to Pro"
                  }
                  sublabel={!isBasicPlan ? "Active" : "Unlock premium features"}
                  sublabelClassName={
                    !isBasicPlan ? "text-green-600" : "text-gray-400"
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

            <div className="space-y-6 min-w-0">{children}</div>
          </div>
        </div>
      </div>
      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        currentPlan={currentPlan}
        onPlanSelect={handlePlanSelect}
      />
    </ListBusinessProvider>
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
