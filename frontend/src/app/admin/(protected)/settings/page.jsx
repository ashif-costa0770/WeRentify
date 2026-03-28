"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";

import { getSettings, updateSettings } from "@/services/admin.service";

const emailRegex = /\S+@\S+\.\S+/;

const getBackendErrorMessage = (error, fallbackMessage) => {
  const payload = error?.response?.data;

  if (typeof payload?.errors === "string" && payload.errors.trim()) {
    return payload.errors;
  }

  if (typeof payload?.message === "string" && payload.message.trim()) {
    return payload.message;
  }

  if (Array.isArray(payload?.errors) && payload.errors.length > 0) {
    const firstError = payload.errors[0];
    if (typeof firstError === "string" && firstError.trim()) return firstError;
    if (typeof firstError?.message === "string" && firstError.message.trim()) {
      return firstError.message;
    }
  }

  if (payload?.errors && typeof payload.errors === "object") {
    const firstValue = Object.values(payload.errors)[0];
    if (typeof firstValue === "string" && firstValue.trim()) return firstValue;
    if (Array.isArray(firstValue) && firstValue.length > 0) {
      const firstItem = firstValue[0];
      if (typeof firstItem === "string" && firstItem.trim()) return firstItem;
      if (typeof firstItem?.message === "string" && firstItem.message.trim()) {
        return firstItem.message;
      }
    }
  }

  return fallbackMessage;
};

function isValidHttpUrl(value) {
  try {
    const u = new URL(value.trim());
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function pickContactPayload(phone, email, address) {
  const out = {};
  const p = phone.trim();
  const e = email.trim();
  const a = address.trim();
  if (p) out.phone = p;
  if (e) out.email = e;
  if (a) out.address = a;
  return out;
}

function pickSocialPayload(facebook, instagram, twitter, linkedin) {
  const out = {};
  const f = facebook.trim();
  const i = instagram.trim();
  const t = twitter.trim();
  const l = linkedin.trim();
  if (f) out.facebook = f;
  if (i) out.instagram = i;
  if (t) out.twitter = t;
  if (l) out.linkedin = l;
  return out;
}

export default function AdminSettingsPage() {
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [twitter, setTwitter] = useState("");
  const [linkedin, setLinkedin] = useState("");

  const [savedLogoUrl, setSavedLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchSettings() {
      setLoading(true);
      try {
        const res = await getSettings();
        const raw = res?.data?.data;
        const doc = Array.isArray(raw) ? raw[0] : raw;
        if (cancelled || !doc) return;

        setPhone(doc.contact?.phone ?? "");
        setEmail(doc.contact?.email ?? "");
        setAddress(doc.contact?.address ?? "");
        setFacebook(doc.social?.facebook ?? "");
        setInstagram(doc.social?.instagram ?? "");
        setTwitter(doc.social?.twitter ?? "");
        setLinkedin(doc.social?.linkedin ?? "");
        setSavedLogoUrl(doc.logo?.url ?? "");
      } catch (err) {
        if (!cancelled) {
          toast.error(getBackendErrorMessage(err, "Failed to load settings"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!logoFile) {
      setLogoPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(logoFile);
    setLogoPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [logoFile]);

  const displayLogoSrc = logoPreviewUrl || savedLogoUrl;

  const validationError = useMemo(() => {
    const p = phone.trim();
    const e = email.trim();
    if (p && p.length < 5) {
      return "Phone must be at least 5 characters if provided.";
    }
    if (e && !emailRegex.test(e)) {
      return "Please enter a valid contact email.";
    }
    const socialPairs = [
      ["Facebook", facebook],
      ["Instagram", instagram],
      ["Twitter / X", twitter],
      ["LinkedIn", linkedin],
    ];
    for (const [label, val] of socialPairs) {
      const v = val.trim();
      if (v && !isValidHttpUrl(v)) {
        return `${label} link must be a valid http(s) URL.`;
      }
    }
    return "";
  }, [phone, email, facebook, instagram, twitter, linkedin]);

  const handlePickLogo = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      event.target.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Logo must be 2MB or smaller.");
      event.target.value = "";
      return;
    }
    setLogoFile(file);
  };

  const clearLogoSelection = () => {
    setLogoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (validationError || submitting) return;

    const contact = pickContactPayload(phone, email, address);
    const social = pickSocialPayload(facebook, instagram, twitter, linkedin);

    if (
      !logoFile &&
      Object.keys(contact).length === 0 &&
      Object.keys(social).length === 0
    ) {
      toast.message("Nothing to save", {
        description: "Update contact, social links, or choose a new logo.",
      });
      return;
    }

    setSubmitting(true);
    try {
      const res = await updateSettings({ contact, social, logoFile });
      const updated = res?.data?.data;
      if (updated?.logo?.url) {
        setSavedLogoUrl(updated.logo.url);
      }
      clearLogoSelection();
      toast.success(res?.data?.message || "Settings saved successfully.");
    } catch (err) {
      toast.error(getBackendErrorMessage(err, "Failed to save settings"));
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10";

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-800">Site settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Update the public logo, contact details, and social profiles shown across the site.
        </p>
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-600 shadow-sm">
          Loading settings…
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-semibold text-slate-800">Branding</h2>
            <p className="mt-1 text-sm text-slate-500">
              Logo appears in the admin sidebar and public areas that use site settings. PNG or JPG,
              max 2MB.
            </p>

            <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-start">
              <div className="flex h-28 w-full max-w-[200px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3">
                {displayLogoSrc ? (
                  <Image
                    src={displayLogoSrc}
                    alt="Site logo preview"
                    width={200}
                    height={112}
                    className="max-h-24 w-auto max-w-full object-contain"
                    unoptimized={Boolean(logoPreviewUrl)}
                  />
                ) : (
                  <span className="text-center text-xs text-slate-400">No logo yet</span>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePickLogo}
                  className="block w-full max-w-md text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
                />
                {logoFile ? (
                  <button
                    type="button"
                    onClick={clearLogoSelection}
                    className="w-fit text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    Remove new selection
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-800">Contact</h2>
              <p className="mt-1 text-sm text-slate-500">
                Shown on your contact page and footer where applicable. Empty fields are not sent, so
                existing saved values stay until you replace them.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className={inputClass}
                    placeholder="+1 234 567 8900"
                    autoComplete="tel"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                    placeholder="hello@company.com"
                    autoComplete="email"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Address
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    rows={3}
                    className={`${inputClass} resize-y min-h-[5rem]`}
                    placeholder="Street, city, region"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-semibold text-slate-800">Social links</h2>
              <p className="mt-1 text-sm text-slate-500">
                Full URLs including https://. Leave blank to keep the current saved link.
              </p>

              <div className="mt-6 space-y-4">
                {[
                  ["Facebook", facebook, setFacebook, "https://facebook.com/…"],
                  ["Instagram", instagram, setInstagram, "https://instagram.com/…"],
                  ["Twitter / X", twitter, setTwitter, "https://x.com/…"],
                  ["LinkedIn", linkedin, setLinkedin, "https://linkedin.com/…"],
                ].map(([label, value, setValue, ph]) => (
                  <div key={label}>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      {label}
                    </label>
                    <input
                      type="url"
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      className={inputClass}
                      placeholder={ph}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {validationError ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {validationError}
            </p>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="submit"
              disabled={Boolean(validationError) || submitting}
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-55"
            >
              {submitting ? "Saving…" : "Save changes"}
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
