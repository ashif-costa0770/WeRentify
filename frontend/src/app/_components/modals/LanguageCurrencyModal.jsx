"use client";
import { LANGUAGES, getGoogleCodeForLanguage } from "@/data/Lang-Curr";
import { persistLanguageAndReload, WERENTIFY_LANG_STORAGE_KEY } from "@/lib/googleTranslate";
import { useEffect, useState } from "react";

export default function LanguageCurrencyModal({ open, onClose }) {
  const [language, setLanguage] = useState("English");

  useEffect(() => {
    if (!open) return;
    try {
      const saved = localStorage.getItem(WERENTIFY_LANG_STORAGE_KEY);
      if (saved && LANGUAGES.includes(saved)) setLanguage(saved);
    } catch {
      /* ignore */
    }
  }, [open]);

  const handleSave = () => {
    const code = getGoogleCodeForLanguage(language);
    persistLanguageAndReload(language, code);
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
      <div className="bg-white max-w-3xl w-full rounded-3xl shadow-2xl overflow-hidden">
        {/* Header (reduced height) */}
        <div className="relative px-8 py-5 text-center">
          <h2 className="text-2xl font-bold text-indigo-500">
            Choose a language
          </h2>

          <button
            onClick={onClose}
            className="absolute right-8 min-w-10 text-xl bg-gray-50 rounded-md p-1 cursor-pointer top-5 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button> 
        </div>


        <hr className="my-4 border-gray-200" />

        {/* Scrollable Content (reduced height) */}
        <div className="px-8 max-h-[50vh] overflow-y-auto pb-4">
          {/* Language */}
          <h3 className="text-lg text-black font-bold mb-3">Language</h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`rounded-xl px-4 py-3 cursor-pointer text-sm transition border ${
                  language === lang
                    ? "bg-gradient-to-r from-[#5B4FE9] to-[#E95FC8] text-white border-transparent font-semibold"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>        
        </div>

        {/* Footer (reduced height) */}
        <div className="px-8 py-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleSave}
            className="w-full py-3 cursor-pointer rounded-xl text-white font-bold bg-gradient-to-r from-[#5B4FE9] to-[#E95FC8]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
