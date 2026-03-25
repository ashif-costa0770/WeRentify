"use client";

import dynamic from "next/dynamic";
import { Globe } from "lucide-react";
import { useState } from "react";

import GoogleTranslate from "@/app/_components/navbar/GoogleTranslate";

const LanguageCurrencyModal = dynamic(
  () => import("@/app/_components/modals/LanguageCurrencyModal"),
  { ssr: false },
);

export default function Header() {
  const [showLang, setShowLang] = useState(false);

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

          <div className="h-10 w-10  rounded-full bg-white text-indigo-600 flex items-center justify-center text-lg font-semibold border border-white/40">
            A
          </div>
        </div>
      </div>

      {showLang && (
        <LanguageCurrencyModal open={showLang} onClose={() => setShowLang(false)} />
      )}
    </header>
  );
}
