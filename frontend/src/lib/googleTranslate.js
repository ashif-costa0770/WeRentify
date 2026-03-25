/** Display names must match `LANGUAGES` in `@/data/Lang-Curr`. */
export const WERENTIFY_LANG_STORAGE_KEY = "werentify_ui_language";

const EXPIRE = "expires=Thu, 01 Jan 1970 00:00:00 UTC";

export function clearGoogTransCookies() {
  if (typeof document === "undefined") return;
  document.cookie = `googtrans=;path=/;${EXPIRE}`;
  const h = typeof window !== "undefined" ? window.location.hostname : "";
  if (h && h !== "localhost" && h !== "127.0.0.1") {
    document.cookie = `googtrans=;path=/;domain=${h};${EXPIRE}`;
    document.cookie = `googtrans=;path=/;domain=.${h};${EXPIRE}`;
  }
}

export function setGoogTransCookie(googleCode) {
  if (typeof document === "undefined") return;
  if (!googleCode || googleCode === "en") {
    clearGoogTransCookies();
    return;
  }
  document.cookie = `googtrans=/en/${googleCode};path=/;max-age=31536000`;
}

/**
 * Keeps the googtrans cookie aligned with saved UI language (e.g. cookie expired).
 */
export function syncGoogTransFromSavedLanguage(getCodeForDisplayName) {
  if (typeof window === "undefined") return;
  let name = null;
  try {
    name = localStorage.getItem(WERENTIFY_LANG_STORAGE_KEY);
  } catch {
    return;
  }
  const code = name ? getCodeForDisplayName(name) : "en";
  if (code === "en") clearGoogTransCookies();
  else setGoogTransCookie(code);
}

/**
 * Call after user confirms language in the modal. Persists choice and reloads so Translate applies.
 */
export function persistLanguageAndReload(displayName, googleCode) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(WERENTIFY_LANG_STORAGE_KEY, displayName);
  } catch {
    /* ignore quota */
  }
  if (googleCode === "en") clearGoogTransCookies();
  else setGoogTransCookie(googleCode);
  window.location.reload();
}

/** Must match the id on the `TranslateElement` container in `GoogleTranslate.jsx`. */
export const GOOGLE_TRANSLATE_WIDGET_ROOT_ID = "google_translate_element";

const SHELL_HIDE = [
  ["display", "none"],
  ["visibility", "hidden"],
  ["height", "0"],
  ["max-height", "0"],
  ["min-height", "0"],
  ["overflow", "hidden"],
  ["opacity", "0"],
  ["margin", "0"],
  ["padding", "0"],
  ["pointer-events", "none"],
];

/** @param {Element} el */
function stripShell(el) {
  for (const [prop, val] of SHELL_HIDE) {
    el.style.setProperty(prop, val, "important");
  }
}

function isTranslateChromeShell(el) {
  const id = el.id || "";
  const cls = typeof el.className === "string" ? el.className : "";
  if (cls.includes("skiptranslate") || cls.includes("goog-te")) return true;
  if (id.includes("goog") || id.includes(".container")) return true;
  return false;
}

/**
 * Google sets `body` with inline `!important` and injects fixed iframes; class names / URLs vary by build.
 * Removing translate chrome iframes (except inside our hidden widget) stops the top bar overlapping the navbar.
 */
export function installGoogleTranslateBannerHider() {
  if (typeof document === "undefined") return () => {};

  const hideChrome = () => {
    try {
      const widget = document.getElementById(GOOGLE_TRANSLATE_WIDGET_ROOT_ID);

      // Hide known banner/menu iframes but do not remove generic translate iframes.
      // Some hidden iframes are required for the translation engine.
      document
        .querySelectorAll(
          "iframe.goog-te-banner-frame, iframe.goog-te-menu-frame, iframe.goog-te-ftab-frame",
        )
        .forEach((node) => {
          if (widget?.contains(node)) return;
          stripShell(node);
        });

      // Google sometimes mounts a top fixed shell like `:1.container skiptranslate`.
      // Hide only direct body children that look like that top bar shell.
      Array.from(document.body.children).forEach((child) => {
        if (widget?.contains(child)) return;
        if (!(child instanceof HTMLElement)) return;
        if (!isTranslateChromeShell(child)) return;
        if (child.querySelector(`#${GOOGLE_TRANSLATE_WIDGET_ROOT_ID}`)) return;
        const st = getComputedStyle(child);
        const pinnedToTop =
          (st.position === "fixed" || st.position === "sticky") &&
          (st.top === "0px" || st.top === "0");
        if (pinnedToTop) {
          stripShell(child);
        }
      });

      document
        .querySelectorAll(".goog-te-banner-frame, .goog-te-menu-frame, .goog-te-ftab-frame")
        .forEach((node) => {
          if (widget?.contains(node)) return;
          stripShell(node);
        });

      document.body.style.setProperty("top", "0", "important");
      document.body.style.setProperty("margin-top", "0", "important");
      document.body.style.setProperty("padding-top", "0", "important");
      document.body.style.setProperty("position", "static", "important");

      document.documentElement.style.setProperty("margin-top", "0", "important");
      document.documentElement.style.setProperty("padding-top", "0", "important");

      document.querySelectorAll("#goog-gt-tt, .goog-te-balloon-frame").forEach((n) => {
        if (!widget?.contains(n)) stripShell(n);
      });
    } catch {
      /* ignore */
    }
  };

  hideChrome();

  const moDom = new MutationObserver(hideChrome);
  const moBodyStyle = new MutationObserver(hideChrome);

  const attachObservers = () => {
    if (!document.body) return;
    moDom.observe(document.body, { childList: true, subtree: true });
    moBodyStyle.observe(document.body, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });
  };

  moDom.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["style", "class"],
  });

  if (document.body) {
    attachObservers();
  } else {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        hideChrome();
        attachObservers();
      },
      { once: true },
    );
  }

  const interval = window.setInterval(hideChrome, 400);

  return () => {
    moDom.disconnect();
    moBodyStyle.disconnect();
    clearInterval(interval);
  };
}
