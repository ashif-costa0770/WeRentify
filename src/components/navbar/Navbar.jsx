"use client";
import Link from "next/link";
import Logo from "@/components/navbar/Logo";
import PackageIcon from "@/components/icons/PackageIcon";
import HomeIcon from "@/components/icons/HomeIcon";
import UsersIcon from "@/components/icons/UsersIcon";
import { useState } from "react";
import SignUpModal from "@/components/modals/SignUpModal";
import SignInModal from "@/components/modals/SignInModal";
import LanguageCurrencyModal from "@/components/modals/LanguageCurrencyModal";

export default function Navbar() {
  const [showSignUp, setShowSignUp] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showLang, setShowLang] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header>
      <div className="max-w-7xl mx-auto px-4 pb-2">
        {/* Desktop & Tablet Layout */}
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Logo />

          {/* Center Navigation Tabs - Hidden on mobile */}
          <div className="hidden md:flex items-center gap-3 lg:gap-6">
            {/* Listings */}
            <Link href="/">
              <button className="rounded-2xl shadow-sm hover:shadow-2xl px-3 lg:px-6 py-3 flex flex-col cursor-pointer items-center gap-1">
                <div className="w-10 lg:w-11 h-10 lg:h-11 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <PackageIcon
                    size={20}
                    className="text-white lg:w-[22px] lg:h-[22px]"
                  />
                </div>
                <span className="text-xs lg:text-sm font-bold text-gray-900">
                  Listings
                </span>
              </button>
            </Link>

            {/* Community */}
            <Link href="/community">
              <button className="rounded-2xl shadow-sm hover:shadow-2xl px-3 lg:px-6 py-3 flex flex-col items-center cursor-pointer gap-1">
                <div className="w-10 lg:w-11 h-10 lg:h-11 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                  <HomeIcon
                    size={20}
                    className="text-white lg:w-[22px] lg:h-[22px]"
                  />
                </div>
                <span className="text-xs lg:text-sm font-bold text-gray-900">
                  Community
                </span>
              </button>
            </Link>

            {/* Services */}
            <Link href="/services">
              <button className="rounded-2xl shadow-sm hover:shadow-2xl px-3 lg:px-6 py-3 flex flex-col items-center cursor-pointer gap-1">
                <div className="w-10 lg:w-11 h-10 lg:h-11 bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-400 rounded-xl flex items-center justify-center shadow-lg">
                  <UsersIcon
                    size={20}
                    className="text-white lg:w-[22px] lg:h-[22px]"
                  />
                </div>
                <span className="text-xs lg:text-sm font-bold text-gray-900">
                  Services
                </span>
              </button>
            </Link>
          </div>

          {/* Right Actions - Desktop */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <button
              onClick={() => setShowSignUp(true)}
              className="px-4 lg:px-6 py-2.5 cursor-pointer rounded-full font-semibold text-sm lg:text-base text-white bg-gradient-to-r from-[#5B4FE9] to-[#E95FC8] shadow-md hover:shadow-lg transition-shadow"
            >
              Sign Up
            </button>

            <button
              onClick={() => setShowSignIn(true)}
              className="px-4 lg:px-6 py-2.5 cursor-pointer rounded-full font-semibold text-sm lg:text-base text-gray-800 bg-gray-50 hover:bg-gray-100 border border-gray-200 shadow-sm transition-colors"
            >
              Login
            </button>

            <button
              onClick={() => setShowLang(true)}
              className="w-10 h-10 cursor-pointer rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
            >
              🌐
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-10 h-10 flex flex-col items-center justify-center gap-1.5 cursor-pointer"
            aria-label="Toggle menu"
          >
            <span
              className={`w-6 h-0.5 bg-gray-800 transition-all ${mobileMenuOpen ? "rotate-45 translate-y-2" : ""}`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-gray-800 transition-all ${mobileMenuOpen ? "opacity-0" : ""}`}
            ></span>
            <span
              className={`w-6 h-0.5 bg-gray-800 transition-all ${mobileMenuOpen ? "-rotate-45 -translate-y-2" : ""}`}
            ></span>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 pt-4">
            {/* Mobile Navigation Links */}
            <div className="flex flex-col gap-3 mb-4">
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full rounded-2xl shadow-sm hover:shadow-lg px-4 py-3 flex items-center cursor-pointer gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 via-fuchsia-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                    <PackageIcon size={20} className="text-white" />
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    Listings
                  </span>
                </button>
              </Link>

              <Link href="/community" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full rounded-2xl shadow-sm hover:shadow-lg px-4 py-3 flex items-center cursor-pointer gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg">
                    <HomeIcon size={20} className="text-white" />
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    Community
                  </span>
                </button>
              </Link>

              <Link href="/services" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full rounded-2xl shadow-sm hover:shadow-lg px-4 py-3 flex items-center cursor-pointer gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-400 rounded-xl flex items-center justify-center shadow-lg">
                    <UsersIcon size={20} className="text-white" />
                  </div>
                  <span className="text-sm font-bold text-gray-900">
                    Services
                  </span>
                </button>
              </Link>
            </div>

            {/* Mobile Actions */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => {
                  setShowSignUp(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full px-6 py-3 cursor-pointer rounded-full font-semibold text-white bg-gradient-to-r from-[#5B4FE9] to-[#E95FC8] shadow-md"
              >
                Sign Up
              </button>

              <button
                onClick={() => {
                  setShowSignIn(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full px-6 py-3 cursor-pointer rounded-full font-semibold text-gray-800 bg-gray-50 hover:bg-gray-100 border border-gray-200 shadow-sm"
              >
                Login
              </button>

              <button
                onClick={() => {
                  setShowLang(true);
                  setMobileMenuOpen(false);
                }}
                className="w-full px-6 py-3 cursor-pointer rounded-full font-semibold text-gray-800 bg-white border border-gray-200 flex items-center justify-center gap-2 shadow-sm"
              >
                <span>🌐</span>
                <span>Language & Currency</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <SignUpModal
        open={showSignUp}
        onClose={() => setShowSignUp(false)}
        onSwitchToSignIn={() => {
          setShowSignUp(false);
          setShowSignIn(true);
        }}
      />

      <SignInModal
        open={showSignIn}
        onClose={() => setShowSignIn(false)}
        onSwitchToSignUp={() => {
          setShowSignIn(false);
          setShowSignUp(true);
        }}
      />

      <LanguageCurrencyModal
        open={showLang}
        onClose={() => setShowLang(false)}
      />
    </header>
  );
}
