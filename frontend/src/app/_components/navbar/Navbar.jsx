"use client";
import Link from "next/link";
import Logo from "@/app/_components/navbar/Logo";
import PackageIcon from "@/app/_components/icons/PackageIcon";
import HomeIcon from "@/app/_components/icons/HomeIcon";
import UsersIcon from "@/app/_components/icons/UsersIcon";
import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useUser } from "@/context/UserContext";
import ProfileDropdown from "./ProfileDropdown";

import { Globe, MapPin, Search } from "lucide-react";
import { getLocationSuggestions as getListingLocationSuggestions } from "@/services/item.service";
import { getLocationSuggestions as getServiceLocationSuggestions } from "@/services/services.service";
import { getPostLocationSuggestions } from "@/services/post.service";
import api from "@/lib/api";

const SignUpModal = dynamic(() => import("@/app/_components/modals/SignUpModal"), {
  ssr: false,
});
const SignInModal = dynamic(() => import("@/app/_components/modals/SignInModal"), {
  ssr: false,
});
const LanguageCurrencyModal = dynamic(
  () => import("@/app/_components/modals/LanguageCurrencyModal"),
  { ssr: false },
);
const MessageSlider = dynamic(() => import("@/app/_components/modals/MessageSlider"), {
  ssr: false,
});

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const lastHandledAuthRef = useRef("");
  const [showLang, setShowLang] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationQuery, setLocationQuery] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionBoxRef = useRef(null);
  const justSelectedRef = useRef(false);
  const hasUserTypedRef = useRef(false);

  const isServicesPage = pathname?.startsWith("/services") ?? false;
  const isCommunityPage = pathname?.startsWith("/community") ?? false;
  const {
    isLogin,
    setIsLogin,
    showSignUp,
    setShowSignUp,
    showSignIn,
    setShowSignIn,
    showMessages,
    setShowMessages,
    selectedConversation,
  } = useUser();

  // Keep navbar input in sync with current URL ?location=...
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const location = params.get("location") || "";
    setLocationQuery(location);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const authType = params.get("auth");
    const redirect = params.get("redirect") || "";
    const key = `${authType || ""}|${redirect}`;

    if (
      authType === "signin" &&
      !isLogin &&
      lastHandledAuthRef.current !== key
    ) {
      setShowSignIn(true);
      lastHandledAuthRef.current = key;
    }
  }, [isLogin, setShowSignIn]);

  //mock data
  const user = {
    name: "Alex Johnson",
    initial: "AJ",
    mode: "Renter", // or "Host"
  };

  const handleUseCurrentLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      alert("Geolocation is not supported in this environment.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          const res = await api.get("/geocode/reverse", {
            params: { lat, lon },
          });

          const payload = res?.data;
          const location =
            payload?.data?.location ||
            payload?.data?.formattedAddress ||
            payload?.location ||
            "";

          if (!location) {
            console.warn("No location returned from reverse geocode");
            return;
          }

          setLocationQuery(location);
          justSelectedRef.current = true;
          setShowSuggestions(false);

          // Trigger existing search logic with the new location (avoid stale state)
          handleSearch(undefined, { location });
        } catch (error) {
          console.error("Failed to detect location", error);
        }
      },
      (error) => {
        console.error("Location permission denied or failed", error);
      }
    );
  };

  const handleSearch = (e, options = {}) => {
    e?.preventDefault?.();
    const selectedLocation = options.location ?? locationQuery;
    const trimmed = (selectedLocation || "").trim();
    const basePath = (pathname || "/").split("?")[0] || "/";
    const path = trimmed
      ? `${basePath}?location=${encodeURIComponent(trimmed)}`
      : basePath;

    router.push(path);

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("werentify:location-search", {
          detail: { location: trimmed },
        }),
      );
    }

    if (options.closeMobileMenu) {
      setMobileMenuOpen(false);
    }
  };

  // Debounced location suggestions (listings API on /, service API on /services)
  useEffect(() => {
    // Only show suggestions after the user has actually typed in this session.
    // This prevents the dropdown from opening on initial load / reload when
    // the input is prefilled from the URL.
    if (!hasUserTypedRef.current) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      setSuggestionsLoading(false);
      return;
    }

    // If a suggestion was just selected (or current location used), we don't want
    // to immediately reopen the dropdown via the debounced effect.
    if (justSelectedRef.current) {
      justSelectedRef.current = false;
      setLocationSuggestions([]);
      setShowSuggestions(false);
      setSuggestionsLoading(false);
      return;
    }

    if (!locationQuery.trim()) {
      setLocationSuggestions([]);
      setShowSuggestions(false);
      setSuggestionsLoading(false);
      return;
    }

    const handler = setTimeout(async () => {
      setSuggestionsLoading(true);
      try {
        const fetchApi = isServicesPage
          ? getServiceLocationSuggestions
          : isCommunityPage
          ? getPostLocationSuggestions
          : getListingLocationSuggestions;
        const res = await fetchApi(locationQuery.trim());
        const list =
          res?.data?.data?.suggestions ||
          res?.data?.data?.locations ||
          res?.data?.suggestions ||
          res?.data?.locations ||
          res?.data?.data ||
          res?.data ||
          [];
        const safe = Array.isArray(list) ? list.slice(0, 5) : [];
        setLocationSuggestions(safe);
        setShowSuggestions(true);
      } catch {
        setLocationSuggestions([]);
        setShowSuggestions(true);
      } finally {
        setSuggestionsLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [locationQuery, isServicesPage, isCommunityPage]);

  // Hide suggestions when clicking outside
  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleClick = (event) => {
      if (
        suggestionBoxRef.current &&
        !suggestionBoxRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, []);

  return (
    <header>
      {" "}
      <div className="max-w-7xl mx-auto pb-1 px-4">
        {/* Desktop & Tablet Layout - logo left, icon tabs, search + actions right */}
        <div className="hidden md:flex items-center gap-4">
          {/* Left: Logo */}
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Center: Icon-card navigation tabs + inline search */}
          <div className="flex-1 flex justify-end">
            <div className="flex items-center gap-2">
              {/* Tabs */}
              <div className="flex items-center me-5 gap-3 lg:gap-6">
                {/* Listings */}
                <Link href="/">
                  <button className="rounded-2xl shadow-sm hover:shadow-2xl px-3 lg:px-6 py-2 flex flex-col cursor-pointer items-center gap-1">
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
                  <button className="rounded-2xl shadow-sm hover:shadow-2xl px-3 lg:px-6 py-2 flex flex-col items-center cursor-pointer gap-1">
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
                  <button className="rounded-2xl shadow-sm hover:shadow-2xl px-3 lg:px-6 py-2 flex flex-col items-center cursor-pointer gap-1">
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
              {/* Inline search input immediately right of tabs + suggestions */}
              <div className="relative" ref={suggestionBoxRef}>
                <form
                  onSubmit={(e) => handleSearch(e)}
                  className="flex items-center gap-2 bg-white rounded-full border border-gray-200 px-3 py-1.5 shadow-sm hover:shadow-md focus-within:ring-2 focus-within:ring-[#a855f7]/20 focus-within:border-[#a855f7]/40 transition-all min-w-[220px] max-w-xs flex-shrink-0"
                >
                  <MapPin className="w-4 h-4 text-gray-400" strokeWidth={2} />
                  <input
                    value={locationQuery}
                    onChange={(e) => {
                      hasUserTypedRef.current = true;
                      setLocationQuery(e.target.value);
                    }}
                    onFocus={() => {
                      // On focus, show dropdown so \"Use current location\" is visible,
                      // but suggestions will only load after the user types.
                      setShowSuggestions(true);
                    }}
                    placeholder="Search by location"
                    className="flex-1 min-w-0 text-xs text-gray-800 placeholder-gray-400 bg-transparent outline-none"
                    aria-label="Search by location"
                  />
                  <button
                    type="submit"
                    className=" cursor-pointer flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-[#a855f7] to-[#9333ea] text-white shadow hover:shadow-md hover:scale-105 active:scale-95 transition-transform"
                    aria-label="Search"
                  >
                    <Search className="w-4 h-8" strokeWidth={2.2} />
                  </button>
                </form>

                {showSuggestions && (
                  <div className="absolute left-0 right-0 mt-1 rounded-2xl bg-white shadow-xl border border-gray-100 py-1 z-30 max-h-64 overflow-y-auto">
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-blue-600 hover:bg-blue-50 border-b border-gray-200 cursor-pointer"
                    >
                      <MapPin className="w-4 h-4 text-blue-500" strokeWidth={2} />
                      <span className="truncate">Use current location</span>
                    </button>
                    {suggestionsLoading ? (
                      <div className="px-3 py-2 text-xs text-gray-500 cursor-default">
                        Loading...
                      </div>
                    ) : locationSuggestions.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-gray-500 cursor-default">
                        No suggestions found
                      </div>
                    ) : (
                      locationSuggestions.map((suggestion, index) => {
                        const label =
                          typeof suggestion === "string"
                            ? suggestion
                            : suggestion?.name || suggestion?.label || "";
                        if (!label) return null;
                        return (
                          <button
                            key={`${label}-${index}`}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              // keep input in sync
                              setLocationQuery(label);
                              // close dropdown
          justSelectedRef.current = true;
          setShowSuggestions(false);
          // use selected value directly to avoid stale state
          handleSearch(undefined, { location: label });
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50 cursor-pointer"
                          >
                            <MapPin className="w-4 h-4 text-gray-400" strokeWidth={2} />
                            <span className="truncate">{label}</span>
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions - Desktop */}
          <div className="flex items-center gap-2 lg:gap-4 basis-[160px] shrink-0 grow-0 justify-end">
            {isLogin ? (
              <>
                <button
                  onClick={() => setShowLang(true)}
                  className="w-10 h-10 cursor-pointer rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <Globe className="w-5 h-5 text-gray-600" />
                </button>

                <div className=" text-gray-700">
                  <ProfileDropdown user={user} />
                </div>
              </>
            ) : (
              <>
                <button
                  onClick={() => setShowSignIn(true)}
                  className="px-4 lg:px-6 py-2.5 cursor-pointer rounded-full font-semibold text-sm lg:text-base text-gray-800 bg-gray-50 hover:bg-gray-100 border border-gray-200 shadow-sm transition-colors"
                >
                  Login
                </button>

                <button
                  onClick={() => setShowLang(true)}
                  className="w-9 h-9 cursor-pointer rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
                >
                  <Globe className="w-4.5 h-4.5 text-gray-600" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Mobile header: Logo + hamburger */}
        <div className="flex md:hidden items-center justify-between">
          <Logo />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="w-10 h-10 flex flex-col items-center justify-center gap-1.5 cursor-pointer"
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
            {/* Mobile Search */}
            <form
              onSubmit={(e) => handleSearch(e, { closeMobileMenu: true })}
              className="mb-4 flex items-center gap-2 bg-white rounded-full border border-gray-200 px-3 py-2 shadow-sm"
            >
              <MapPin className="w-4 h-4 text-gray-400" strokeWidth={2} />
              <input
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Search by location"
                className="flex-1 min-w-0 text-xs text-gray-800 placeholder-gray-400 bg-transparent outline-none"
                aria-label="Search by location"
              />
              <button
                type="submit"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-[#a855f7] to-[#9333ea] text-white shadow hover:shadow-md active:scale-95 transition-transform"
                aria-label="Search"
              >
                <Search className="w-4 h-4" strokeWidth={2.2} />
              </button>
            </form>

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
                <span>ðŸŒ</span>
                <span>Language & Currency</span>
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Modals */}
      {showSignUp && (
        <SignUpModal
          open={showSignUp}
          onClose={() => setShowSignUp(false)}
          onSwitchToSignIn={() => {
            setShowSignUp(false);
            setShowSignIn(true);
          }}
          setIsLogin={setIsLogin}
        />
      )}
      {showSignIn && (
        <SignInModal
          open={showSignIn}
          onClose={() => setShowSignIn(false)}
          onSwitchToSignUp={() => {
            setShowSignIn(false);
            setShowSignUp(true);
          }}
          setIsLogin={setIsLogin}
        />
      )}
      {showLang && (
        <LanguageCurrencyModal open={showLang} onClose={() => setShowLang(false)} />
      )}
      {showMessages && (
        <MessageSlider
          showMessages={showMessages}
          setShowMessages={setShowMessages}
          selectedConversation={selectedConversation}
        />
      )}
    </header>
  );
}
