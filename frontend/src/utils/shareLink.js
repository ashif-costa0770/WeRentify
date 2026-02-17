export function buildAbsoluteUrl(pathOrUrl = "") {
  if (typeof window === "undefined") return pathOrUrl;
  if (!pathOrUrl) return window.location.href;
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
  return new URL(pathOrUrl, window.location.origin).toString();
}

async function copyWithFallback(text) {
  if (typeof document === "undefined") return false;

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";

  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }

  document.body.removeChild(textarea);
  return copied;
}

export async function shareOrCopyLink({ title, text, url }) {
  const resolvedUrl = buildAbsoluteUrl(url);

  if (navigator.share) {
    try {
      await navigator.share({ title, text, url: resolvedUrl });
      return "shared";
    } catch (error) {
      if (error?.name === "AbortError") return "cancelled";
    }
  }

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(resolvedUrl);
      return "copied";
    } catch {
      // Fall through to legacy fallback.
    }
  }

  const copied = await copyWithFallback(resolvedUrl);
  return copied ? "copied" : "failed";
}
