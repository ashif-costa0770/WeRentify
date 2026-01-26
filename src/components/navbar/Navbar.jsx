"use client";

import Logo from "@/components/navbar/Logo";
import PackageIcon from "@/components/icons/PackageIcon";
import HomeIcon from "@/components/icons/HomeIcon";
import UsersIcon from "@/components/icons/UsersIcon";
import HeroSearch from "./HeroSearch";
// import { useState } from "react";
// import SignUpModal from "@/components/modals/SignUpModal";
// import SignInModal from "@/components/modals/SignInModal";
// import LanguageCurrencyModal from "@/components/modals/LanguageCurrencyModal";

export default function Navbar() {
  // const [showSignUp, setShowSignUp] = useState(false);
  // const [showSignIn, setShowSignIn] = useState(false);
  // const [showLang, setShowLang] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-gray-100 pb-4 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 pb-2 flex items-center justify-between">
        {/* Logo */}
        <Logo />

        {/* Center Navigation Tabs */}
        <div className="flex items-center gap-6">
          {/* Listings */}
          <button className=" rounded-2xl shadow-sm  hover:shadow-2xl px-6 py-3 flex flex-col cursor-pointer items-center gap-1">
            <div className="w-11 h-11 bg-linear-to-br from-violet-500 via-fuchsia-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <PackageIcon size={22} className="text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">Listings</span>
          </button>

          {/* Community */}
          <button className=" rounded-2xl shadow-sm  hover:shadow-2xl  px-6 py-3 flex flex-col items-center cursor-pointer gap-1">
            <div className="w-11 h-11 bg-linear-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
              <HomeIcon size={22} className="text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">Community</span>
          </button>

          {/* Services */}
          <button className=" rounded-2xl shadow-sm  hover:shadow-2xl px-6 py-3 flex flex-col items-center cursor-pointer gap-1">
            <div className="w-11 h-11 bg-linear-to-br from-orange-400 via-amber-500 to-yellow-400 rounded-xl flex items-center justify-center shadow-lg">
              <UsersIcon size={22} className="text-white" />
            </div>
            <span className="text-sm font-bold text-gray-900">Services</span>
          </button>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSignUp(true)}
            className="px-6 py-2.5 cursor-pointer rounded-full font-semibold text-white  bg-linear-to-r from-[#5B4FE9] to-[#E95FC8]   shadow-md"
          >
            Sign Up
          </button>

          {/* <SignUpModal
            open={showSignUp}
            onClose={() => setShowSignUp(false)}
            onSwitchToSignIn={() => {
              setShowSignUp(false);
              setShowSignIn(true);
            }}
          /> */}

          <button
            onClick={() => setShowSignIn(true)}
            className="px-6 py-2.5 cursor-pointer rounded-full font-semibold text-gray-800 bg-gray-50  hover:bg-gray-100 border border-gray-200 shadow-sm"
          >
            Login
          </button>

          {/* <SignInModal
            open={showSignIn}
            onClose={() => setShowSignIn(false)}
            onSwitchToSignUp={() => {
              setShowSignIn(false);
              setShowSignUp(true);
            }}
          /> */}

          <button
            onClick={() => setShowLang(true)}
            className="w-10 h-10 cursor-pointer rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm"
          >
            🌐
          </button>

          {/* <LanguageCurrencyModal
            open={showLang}
            onClose={() => setShowLang(false)}
          /> */}
        </div>
      </div>
      <HeroSearch />
    </header>
  );
}
