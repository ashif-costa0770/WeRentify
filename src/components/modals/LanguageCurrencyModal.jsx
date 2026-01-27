"use client";

import { useState } from "react";

const LANGUAGES = [
  "English",
  "Español",
  "Français",
  "Deutsch",
  "Italiano",
  "Português",
  "Nederlands",
  "Svenska",
  "Dansk",
  "Norsk",
  "中文 (简体)",
  "中文 (繁體)",
  "日本語",
  "한국어",
  "Türkçe",
  "Русский",
  "Polski",
  "Čeština",
  "Magyar",
  "Română",
  "العربية",
  "עברית",
  "ไทย",
  "Bahasa Indonesia",
  "Bahasa Melayu",
  "Tiếng Việt",
  "Filipino",
  "हिन्दी",
  "Українська",
  "Hrvatski",
  "Slovenčina",
  "Slovenščina",
  "Suomi",
  "Български",
  "Ελληνικά",
  "Íslenska",
  "Latviešu",
  "Lietuvių",
  "Shqip",
  "Català",
  "Eesti",
  "Galego",
  "Malti",
  "македонски",
  "বাংলা",
  "ქართული",
  "Azərbaycan",
  "Қазақ тілі",
  "Bosanski",
  "Српски",
  "Mongolian",
  "Հայերեն",
  "ລາວ",
  "မြန်မာဘာသာ",
  "नेपाली",
  "සිංහල",
  "தமிழ்",
  "తెలుగు",
];

const CURRENCIES = [
  { code: "USD", name: "United States dollar", symbol: "$" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British pound", symbol: "£" },
  { code: "CAD", name: "Canadian dollar", symbol: "C$" },
  { code: "AUD", name: "Australian dollar", symbol: "A$" },
  { code: "JPY", name: "Japanese yen", symbol: "¥" },
  { code: "CNY", name: "Chinese yuan", symbol: "¥" },
  { code: "CHF", name: "Swiss franc", symbol: "CHF" },
  { code: "SEK", name: "Swedish krona", symbol: "kr" },
  { code: "NZD", name: "New Zealand dollar", symbol: "NZ$" },
  { code: "MXN", name: "Mexican peso", symbol: "MX$" },
  { code: "SGD", name: "Singapore dollar", symbol: "S$" },
  { code: "HKD", name: "Hong Kong dollar", symbol: "HK$" },
  { code: "NOK", name: "Norwegian krone", symbol: "kr" },
  { code: "KRW", name: "South Korean won", symbol: "₩" },
  { code: "TRY", name: "Turkish lira", symbol: "₺" },
  { code: "RUB", name: "Russian ruble", symbol: "₽" },
  { code: "INR", name: "Indian rupee", symbol: "₹" },
  { code: "BRL", name: "Brazilian real", symbol: "R$" },
  { code: "ZAR", name: "South African rand", symbol: "R" },
  { code: "DKK", name: "Danish krone", symbol: "kr" },
  { code: "PLN", name: "Polish zloty", symbol: "zł" },
  { code: "THB", name: "Thai baht", symbol: "฿" },
  { code: "MYR", name: "Malaysian ringgit", symbol: "RM" },
  { code: "IDR", name: "Indonesian rupiah", symbol: "Rp" },
  { code: "PHP", name: "Philippine peso", symbol: "₱" },
  { code: "CZK", name: "Czech koruna", symbol: "Kč" },
  { code: "HUF", name: "Hungarian forint", symbol: "Ft" },
  { code: "ILS", name: "Israeli new shekel", symbol: "₪" },
  { code: "CLP", name: "Chilean peso", symbol: "CLP$" },
  { code: "AED", name: "UAE dirham", symbol: "د.إ" },
  { code: "COP", name: "Colombian peso", symbol: "COL$" },
  { code: "SAR", name: "Saudi riyal", symbol: "SR" },
  { code: "TWD", name: "Taiwan dollar", symbol: "NT$" },
  { code: "RON", name: "Romanian leu", symbol: "lei" },
  { code: "HRK", name: "Croatian kuna", symbol: "kn" },
  { code: "BGN", name: "Bulgarian lev", symbol: "лв" },
  { code: "ARS", name: "Argentine peso", symbol: "AR$" },
  { code: "PEN", name: "Peruvian sol", symbol: "S/" },
  { code: "VND", name: "Vietnamese dong", symbol: "₫" },
];

export default function LanguageCurrencyModal({ open, onClose }) {
  const [language, setLanguage] = useState("English");
  const [currency, setCurrency] = useState("USD");
  const [translate, setTranslate] = useState(false);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
      <div className="bg-white max-w-5xl w-full rounded-3xl shadow-2xl overflow-hidden">
        {/* Header (reduced height) */}
        <div className="relative px-8 py-5 text-center">
          <h2 className="text-2xl font-bold text-indigo-500">
            Choose a language and currency
          </h2>

          <button
            onClick={onClose}
            className="absolute right-8 min-w-10 text-xl bg-gray-50 rounded-md p-1 cursor-pointer top-5 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* Translation Toggle */}
        <div className="px-8">
          <div className="bg-gray-50 rounded-xl px-6 py-3 flex justify-between items-center">
            <div className="mx-auto">
              <p className="font-semibold text-gray-900 text-center">
                Translation
              </p>
              <p className="text-sm text-gray-500">
                Automatically translate descriptions and reviews to English
              </p>
            </div>

            <button
              onClick={() => setTranslate(!translate)}
              className={`w-12 h-6 rounded-full relative transition ${
                translate ? "bg-indigo-500" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition ${
                  translate ? "right-0.5" : "left-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        <hr className="my-4 border-gray-200" />

        {/* Scrollable Content (reduced height) */}
        <div className="px-8 max-h-[45vh] overflow-y-auto pb-4">
          {/* Language */}
          <h3 className="text-lg text-black font-bold mb-3">Language</h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
            {LANGUAGES.map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`rounded-xl px-4 py-3 text-sm transition border ${
                  language === lang
                    ? "bg-gradient-to-r from-[#5B4FE9] to-[#E95FC8] text-white border-transparent font-semibold"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Currency */}
          <h3 className="text-lg text-black font-bold mb-3">Currency</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {CURRENCIES.map((cur) => (
              <button
                key={cur.code}
                onClick={() => setCurrency(cur.code)}
                className={`rounded-xl px-5 py-4 text-center border transition ${
                  currency === cur.code
                    ? "bg-gradient-to-r from-[#5B4FE9] to-[#E95FC8] text-white border-transparent"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <p className={`font-bold ${currency === cur.code ? "text-white/90" : "text-gray-500"}`}>{cur.code}</p>
                <p
                  className={`text-sm ${currency === cur.code ? "text-white/90" : "text-gray-500"}`}
                >
                  {cur.name}
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Footer (reduced height) */}
        <div className="px-8 py-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl text-white font-bold bg-gradient-to-r from-[#5B4FE9] to-[#E95FC8]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
