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

/** @param {HTMLElement} el */
function elementClassString(el) {
  const c = el.className;
  if (typeof c === "string") return c;
  return c?.toString?.() ?? "";
}

/** @param {HTMLIFrameElement} node */
function isTranslateUiIframe(node) {
  const cls = elementClassString(node);
  const src = node.getAttribute("src") || "";
  if (cls.includes("goog-te-banner-frame") || cls.includes("goog-te-menu-frame") || cls.includes("goog-te-ftab-frame"))
    return true;
  if (node.classList?.contains("skiptranslate") && /translate\.google|translate\.googleapis\.com/i.test(src))
    return true;
  // Toolbar iframe without legacy classes (some builds).
  if (/translate\.google\.com/i.test(src)) {
    const r = node.getBoundingClientRect();
    if (r.height >= 12 && r.width >= 120) return true;
  }
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
      const body = document.body;

      // Toolbar is almost always a direct `body` child; our widget lives nested in the navbar (see SO / Google).
      if (body) {
        Array.from(body.children).forEach((child) => {
          if (!(child instanceof HTMLElement)) return;
          if (widget?.contains(child)) return;
          const cs = elementClassString(child);
          if (cs.includes("skiptranslate") || cs.includes("VIpgJd")) stripShell(child);
        });
      }

      // Hide known banner/menu iframes but do not remove generic translate iframes.
      // Some hidden iframes are required for the translation engine.
      document.querySelectorAll("iframe").forEach((node) => {
        if (!(node instanceof HTMLIFrameElement)) return;
        if (widget?.contains(node)) return;
        if (!isTranslateUiIframe(node)) return;
        stripShell(node);
      });

      // Wrapper divs around the new toolbar (iframe may not be a direct body child).
      document.querySelectorAll("div.skiptranslate").forEach((child) => {
        if (widget?.contains(child)) return;
        if (child.querySelector(`#${GOOGLE_TRANSLATE_WIDGET_ROOT_ID}`)) return;
        const st = getComputedStyle(child);
        const pinnedToTop =
          (st.position === "fixed" || st.position === "sticky") &&
          (st.top === "0px" || st.top === "0");
        if (pinnedToTop) stripShell(child);
      });

      // Google sometimes mounts a top fixed shell like `:1.container skiptranslate`.
      // Hide direct body children that look like translate chrome (not only when pinned — some builds use absolute).
      if (body) {
        Array.from(body.children).forEach((child) => {
          if (widget?.contains(child)) return;
          if (!(child instanceof HTMLElement)) return;
          if (!isTranslateChromeShell(child)) return;
          if (child.querySelector(`#${GOOGLE_TRANSLATE_WIDGET_ROOT_ID}`)) return;
          const st = getComputedStyle(child);
          const pinnedToTop =
            (st.position === "fixed" || st.position === "sticky") &&
            (st.top === "0px" || st.top === "0");
          const absAtTop =
            st.position === "absolute" &&
            (st.top === "0px" || st.top === "0" || Number.parseFloat(st.top) <= 4);
          const atTop =
            pinnedToTop ||
            absAtTop ||
            (child.tagName === "IFRAME" && isTranslateUiIframe(child));
          if (atTop) stripShell(child);
        });
      }

      // Toolbar occasionally injected as a direct child of `html` (not `body`).
      if (document.documentElement) {
        Array.from(document.documentElement.children).forEach((child) => {
          if (child === document.body) return;
          if (!(child instanceof HTMLElement)) return;
          if (widget?.contains(child)) return;
          if (!isTranslateChromeShell(child) && child.tagName !== "IFRAME") return;
          if (child.tagName === "IFRAME" && !isTranslateUiIframe(child)) return;
          if (child.querySelector?.(`#${GOOGLE_TRANSLATE_WIDGET_ROOT_ID}`)) return;
          stripShell(child);
        });
      }

      document
        .querySelectorAll(".goog-te-banner-frame, .goog-te-menu-frame, .goog-te-ftab-frame")
        .forEach((node) => {
          if (widget?.contains(node)) return;
          stripShell(node);
        });

      if (body) {
        body.style.setProperty("top", "0", "important");
        body.style.setProperty("margin-top", "0", "important");
        body.style.setProperty("padding-top", "0", "important");
        body.style.setProperty("position", "static", "important");
      }

      document.documentElement.style.setProperty("margin-top", "0", "important");
      document.documentElement.style.setProperty("padding-top", "0", "important");
      document.documentElement.style.setProperty("top", "0", "important");

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

  moDom.observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["style", "class"],
  });

  if (document.body) {
    moBodyStyle.observe(document.body, {
      attributes: true,
      attributeFilter: ["style", "class"],
    });
  } else {
    document.addEventListener(
      "DOMContentLoaded",
      () => {
        hideChrome();
        moBodyStyle.observe(document.body, {
          attributes: true,
          attributeFilter: ["style", "class"],
        });
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
