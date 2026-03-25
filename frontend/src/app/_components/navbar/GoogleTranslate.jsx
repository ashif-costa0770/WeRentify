"use client";

import { useEffect } from "react";
import {
  GOOGLE_TRANSLATE_WIDGET_ROOT_ID,
  installGoogleTranslateBannerHider,
  syncGoogTransFromSavedLanguage,
} from "@/lib/googleTranslate";
import {
  getGoogleCodeForLanguage,
  GOOGLE_TRANSLATE_INCLUDED_LANGUAGES,
} from "@/data/Lang-Curr";

const ELEMENT_ID = GOOGLE_TRANSLATE_WIDGET_ROOT_ID;
const GT_SCRIPT_MARKER = "translate.google.com/translate_a/element.js";

function initTranslateWidget() {
  const el = document.getElementById(ELEMENT_ID);
  if (!el || !window.google?.translate?.TranslateElement) return;
  if (el.childNodes.length > 0) return;

  new window.google.translate.TranslateElement(
    {
      pageLanguage: "en",
      includedLanguages: GOOGLE_TRANSLATE_INCLUDED_LANGUAGES,
      layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE,
      autoDisplay: false,
    },
    ELEMENT_ID,
  );
}

export default function GoogleTranslate() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    syncGoogTransFromSavedLanguage(getGoogleCodeForLanguage);
    const removeBannerHider = installGoogleTranslateBannerHider();

    window.googleTranslateElementInit = function googleTranslateElementInit() {
      initTranslateWidget();
    };

    const existingScript = document.querySelector(`script[src*="${GT_SCRIPT_MARKER}"]`);

    if (existingScript) {
      if (window.google?.translate?.TranslateElement) {
        initTranslateWidget();
      }
    } else {
      const script = document.createElement("script");
      script.src = `//${GT_SCRIPT_MARKER}?cb=googleTranslateElementInit`;
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      removeBannerHider();
    };
  }, []);

  return (
    <div
      className="fixed left-0 top-0 z-[9999] h-0 w-0 overflow-hidden opacity-0 pointer-events-none"
      aria-hidden
    >
      <div id={ELEMENT_ID} />
    </div>
  );
}
