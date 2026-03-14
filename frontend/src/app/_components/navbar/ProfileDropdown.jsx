// components/ProfileDropdown.jsx
"use client";

import { useState, useRef, useEffect } from "react";
import {
  User,
  CircleHelp,
  Settings,
  LogOut,
  Home,
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { logout } from "@/services/auth.service";
import { toast } from "sonner";

export default function ProfileDropdown({
  // user = { firstname: "Alex", lastname: "Johnson", initial: "AJ", mode: "Renter" },
}) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef(null);
  const dropdownRef = useRef(null);
  const router = useRouter();

  const { user, setIsLogin, setUser } = useUser();

  const fullName = `${user?.firstname || ""} ${user?.lastname || ""}`.trim();
  const displayName = fullName || "User";
  const avatarInitial = user?.firstname?.charAt(0) || "U";
  const displayMode = user?.mode || "Renter";

  // handle logout
  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setIsLogin(false);
      setIsOpen(false);
      toast.success("Logout successfull");
      router.push("/");

      
    } catch (error) {
      console.log(error);
    }
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
    { icon: Settings, label: "Settings", href: "/settings" },
    { icon: CircleHelp, label: "Help", href: "/help" },
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
          className="w-11 h-11 rounded-full bg-gradient-to-br from-[#5B4FE9] to-[#E95FC8] text-white cursor-pointer font-bold text-md flex items-center justify-center  hover:scale-105 transition-all border-2 border-white"
          onClick={() => setIsOpen(!isOpen)}
        >
          {avatarInitial}
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
            <h3 className="font-bold text-gray-900 text-md "> {displayName}</h3>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <Home className="w-4 h-4 text-gray-400" />
              <span>{displayMode} Mode</span>
            </div>
          </div>

          {/* Main Menu Items */}
          <div className="py-1">
            {menuItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors group"
              >
                <div className="flex items-center gap-2">
                  <item.icon className={`w-4 h-4 ${item.color || "text-gray-500"}`} />
                  <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900">
                    {item.label}
                  </span>
                </div>
              </Link>
            ))}
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

    </div>
  );
}
