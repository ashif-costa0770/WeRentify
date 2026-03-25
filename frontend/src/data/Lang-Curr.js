/** Google Translate element / googtrans target codes for each `LANGUAGES` label. */
export const LANGUAGE_TO_GOOGLE_CODE = {
  // 🌍 Global
  English: "en",
  Español: "es",
  Français: "fr",
  Deutsch: "de",
  Português: "pt",
  Русский: "ru",
  Türkçe: "tr",
  Italiano: "it",
  Polski: "pl",
  Dutch: "nl",
  Indonesian: "id",
  "中文 (简体)": "zh-CN",
  日本語: "ja",
  العربية: "ar",
  فارسی: "fa",

  // 🇮🇳 Indian
  हिन्दी: "hi",
  ગુજરાતી: "gu",
  मराठी: "mr",
  বাংলা: "bn",
  தமிழ்: "ta",
  తెలుగు: "te",
  ಕನ್ನಡ: "kn",
  urdu: "ur",
  മലയാളം: "ml",
  ਪੰਜਾਬੀ: "pa",
};

export function getGoogleCodeForLanguage(displayName) {
  return LANGUAGE_TO_GOOGLE_CODE[displayName] ?? "en";
}

export const GOOGLE_TRANSLATE_INCLUDED_LANGUAGES = [
  ...new Set(
    Object.values(LANGUAGE_TO_GOOGLE_CODE).filter((code) => code !== "en"),
  ),
].join(",");

export const LANGUAGES = [
  // 🌍 Global (commonly used)
  "English",
  "Español",
  "Français",
  "Deutsch",
  "Português",
  "Русский",
  "Türkçe",
  "Polski",
  "Dutch",
  "Indonesian",
  "Italiano",
  "中文 (简体)",
  "日本語",
  "فارسی",
  "العربية",

  // 🇮🇳 Indian languages (important for your app)
  "हिन्दी",
  "ગુજરાતી",
  "मराठी",
  "বাংলা",
  "தமிழ்",
  "తెలుగు",
  "ಕನ್ನಡ",
  "urdu",
  "മലയാളം",
  "ਪੰਜਾਬੀ"
];