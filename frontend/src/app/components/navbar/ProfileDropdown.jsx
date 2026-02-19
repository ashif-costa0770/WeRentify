// components/ProfileDropdown.jsx
"use client";

import { useState, useRef, useEffect } from "react";
import {
  User,
  MessageCircle,
  Heart,
  Crown,
  Building2,
  HelpCircle,
  Settings,
  LogOut,
  Home,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import PricingModal from "../modals/PricingModal";
import { logout } from "@/services/auth.service";
import { toast } from "sonner";

export default function ProfileDropdown({
  // user = { name: "Alex Johnson", initial: "AJ", mode: "Renter" },
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [showPricing, setShowPricing] = useState(false);
  
  // Initialize state with localStorage value
  const [currentPlan, setCurrentPlan] = useState(() => {
    const savedPlan = localStorage.getItem("userPlan");
    return savedPlan || "basic";
  });
  
  const timeoutRef = useRef(null);
  const dropdownRef = useRef(null);

  const { user, isLogin, setIsLogin, setShowMessages } = useUser();

  const fullName = `${user?.firstname || ""} ${user?.lastname || ""}`.trim();

  // handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setIsLogin(false);
      setIsOpen(false);
      toast.success("Logout successfull")

      
    } catch (error) {
      console.log(error);
    }
  };

  const handlePlanSelect = (planId) => {
    setCurrentPlan(planId);
    localStorage.setItem("userPlan", planId); // Save to localStorage when plan changes
  };

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 300);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const menuItems = [
    { icon: User, label: "Profile", href: "/profile", color: "text-[#5B4FE9]" },
    { icon: MessageCircle, label: "Messages", href: "/messages", count: 3 },
    { icon: Heart, label: "Favorites", href: "/favorites" },
    { icon: Crown, label: "My Listings", href: "/my-listings" },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Icons Container */}
      <div
        className="flex items-center gap-3 cursor-pointer"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Avatar */}
        <button
          className="w-10 h-10 rounded-full bg-gradient-to-br from-[#5B4FE9] to-[#E95FC8] text-white cursor-pointer font-bold text-xs flex items-center justify-center  hover:scale-105 transition-all border-2 border-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {user.firstname.charAt(0) || user.name.charAt(0)}
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{ minWidth: "250px" }}
          className="absolute right-0 top-full mt-2  bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-in  duration-200 z-40  "
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* User Info Header - Reduced padding */}
          <div className="px-4 pb-4 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-md "> {fullName || user.name}</h3>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <Home className="w-4 h-4 text-gray-400" />
              <span>{user.mode} Mode</span>
            </div>
          </div>

          {/* Main Menu Items*/}
          <div className="py-1">
            {menuItems.map((item, index) => {
              // Special handling for Messages
              if (item.label === "Messages") {
                return (
                  <button
                    key={index}
                    onClick={() => {
                      setShowMessages(true);
                      setIsOpen(false);
                    }}
                    className="w-full flex cursor-pointer items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors group text-left"
                  >
                    <div className="flex items-center gap-2">
                      <item.icon
                        className={`w-4 h-4 ${item.color || "text-gray-500"}`}
                      />
                      <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                        {item.label}
                      </span>
                    </div>
                  </button>
                );
              }

              return (
                <Link
                  key={index}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <item.icon
                      className={`w-4 h-4 ${item.color || "text-gray-500"}`}
                    />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                      {item.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="border-t border-gray-100 my-2" />

          {/* Action Items - Tighter spacing */}
          <div className="py-2">
            {/* Switch to Host */}
            <Link
              href="/switch-host"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-start gap-2 w-full">
                <Building2 className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 block leading-tight">
                    Switch to Host
                  </span>
                  <span className="text-[11px] text-gray-400 leading-tight block mt-0.5">
                    List & earn money
                  </span>
                </div>
              </div>
            </Link>

            {/* Upgrade to Pro - Opens Pricing Modal */}
            <button
              onClick={() => {
                setShowPricing(true);
                setIsOpen(false);
              }}
              className="w-full flex cursor-pointer items-center px-4 py-3 hover:bg-gray-50 transition-colors group text-left"
            >
              <div className="flex items-start gap-2 w-full">
                <Crown className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 block leading-tight">
                    {currentPlan === "pro" ? "Pro Member" : "Upgrade to Pro"}
                  </span>
                  {currentPlan === "pro" && (
                    <span className="text-[11px] text-green-600 block">
                      Active
                    </span>
                  )}
                </div>
              </div>
            </button>

            {/* Help Center */}
            <Link
              href="/help"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-start gap-2 w-full">
                <HelpCircle className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 block leading-tight">
                    Help Center
                  </span>
                </div>
              </div>
            </Link>

            {/* Settings */}
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center px-4 py-3 hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-start gap-2 w-full">
                <Settings className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 block leading-tight">
                    Settings
                  </span>
                </div>
              </div>
            </Link>
          </div>

          <div className="border-t border-gray-100 my-2" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full cursor-pointer flex items-center gap-2 px-4 py-2 hover:bg-red-50 transition-colors text-left "
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-red-500">Logout</span>
          </button>
        </div>
      )}

      {/* Pricing Modal */}
      <PricingModal
        isOpen={showPricing}
        onClose={() => setShowPricing(false)}
        currentPlan={currentPlan}
        onPlanSelect={handlePlanSelect}
      />
    </div>
  );
}