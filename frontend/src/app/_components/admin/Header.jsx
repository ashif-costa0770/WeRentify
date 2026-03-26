"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Globe, LogOut, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import GoogleTranslate from "@/app/_components/navbar/GoogleTranslate";
import { adminLogout, getAdminProfile } from "@/services/admin.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LanguageCurrencyModal = dynamic(
  () => import("@/app/_components/modals/LanguageCurrencyModal"),
  { ssr: false },
);

export default function Header() {
  const router = useRouter();
  const [showLang, setShowLang] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [adminName, setAdminName] = useState("A");
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadAdmin() {
      try {
        const res = await getAdminProfile();
        const profile = res?.data?.data || {};
        const nameSource = profile?.name || profile?.email || "A";
        const initial = String(nameSource).trim().charAt(0).toUpperCase() || "A";
        if (!cancelled) setAdminName(initial);
      } catch {
        if (!cancelled) setAdminName("A");
      }
    }

    loadAdmin();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleLogout = async () => {
    if (loggingOut) return;

    setLoggingOut(true);
    try {
      await adminLogout();
    } catch {
      // Redirect anyway so admin can re-authenticate.
    } finally {
      router.replace("/admin/login");
      router.refresh();
      setLoggingOut(false);
    }
  };

  return (
    <header className="h-20 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-500 text-white shadow-md px-5 sm:px-6">
      <div className="h-full flex items-center justify-between gap-4">
        <div className="w-full max-w-md">
          <div className="flex items-center gap-2 rounded-lg bg-white/15 border border-white/25 px-3 py-2.5">
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="h-4 w-4 text-white/85"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="m20 20-3.5-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          <input
            type="text"
            placeholder="Search..."
            className="w-full bg-transparent placeholder:text-white/70 text-sm outline-none"
          />
        </div>
      </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <GoogleTranslate />

          <button
            type="button"
            aria-label="Language and currency"
            onClick={() => setShowLang(true)}
            className="rounded-full p-2.5 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <Globe className="h-5 w-5" />
          </button>

          <button
            type="button"
            aria-label="Notifications"
            className="relative rounded-full p-2.5 hover:bg-white/20 transition-colors cursor-pointer"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
              <path
                d="M12 4a4 4 0 0 0-4 4v2.5c0 .8-.3 1.6-.8 2.2L6 14h12l-1.2-1.3a3.2 3.2 0 0 1-.8-2.2V8a4 4 0 0 0-4-4Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path
                d="M10 17a2 2 0 0 0 4 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              />
            </svg>
          </button>

          <div
            onMouseEnter={() => setProfileMenuOpen(true)}
            onMouseLeave={() => setProfileMenuOpen(false)}
          >
            <DropdownMenu open={profileMenuOpen} onOpenChange={setProfileMenuOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Admin profile menu"
                  className="h-10 w-10 rounded-full bg-white text-indigo-600 flex items-center justify-center text-lg font-semibold border border-white/40 hover:scale-[1.02] transition-transform cursor-pointer"
                >
                  {adminName}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-40">
                <DropdownMenuItem asChild>
                  <Link href="/admin/profile" className="cursor-pointer">
                    <UserRound className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={handleLogout}
                  disabled={loggingOut}
                >
                  <LogOut className="h-4 w-4 text-destructive" />
                  {loggingOut ? "Logging out..." : "Logout"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {showLang && (
        <LanguageCurrencyModal open={showLang} onClose={() => setShowLang(false)} />
      )}
    </header>
  );
}
