"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Suspense } from "react";
import * as LucideIcons from "lucide-react";
import Navbar from "@/app/_components/navbar/Navbar";
import { getHelpCategories } from "@/services/help.service";

const defaultDescription = "Find answers to common questions in this category.";
const fallbackIcon = LucideIcons.CircleHelp;

const normalizeToPascalCase = (value) =>
  String(value || "")
    .trim()
    .replace(/[_\s-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join("");

const getIconComponent = (iconName) => {
  if (!iconName || typeof iconName !== "string") return fallbackIcon;

  const raw = iconName.trim();
  if (LucideIcons[raw]) return LucideIcons[raw];

  const pascal = normalizeToPascalCase(raw);
  if (LucideIcons[pascal]) return LucideIcons[pascal];

  const lower = raw.toLowerCase();
  const matchedKey = Object.keys(LucideIcons).find(
    (key) => key.toLowerCase() === lower,
  );
  return (matchedKey && LucideIcons[matchedKey]) || fallbackIcon;
};

export default function HelpPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchCategories() {
      setLoading(true);
      setError("");
      try {
        const res = await getHelpCategories();
        const data = res?.data?.data;
        const list = Array.isArray(data) ? data : [];
        if (!cancelled) {
          setCategories(list);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(
            fetchError?.response?.data?.message ||
              "Failed to load help categories.",
          );
          setCategories([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchCategories();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-50 bg-gray-100 shadow-lg">
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
      </div>

      <main className="mx-auto w-full max-w-6xl px-4 py-10">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Help Center</h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            Browse categories and open FAQs to find quick answers.
          </p>
        </header>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-36 animate-pulse rounded-2xl border border-gray-200 bg-white"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : categories.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-6 text-sm text-gray-600">
            No help categories available yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => {
              const Icon = getIconComponent(category?.icon);
              return (
                <Link
                  key={category?._id || category?.slug}
                  href={`/help/${category?.slug}`}
                  className="group rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
                >
                  <div className="mb-4 inline-flex rounded-xl bg-indigo-50 p-2 text-indigo-600">
                    <Icon size={18} />
                  </div>
                  <h2 className="text-base font-semibold text-gray-900 group-hover:text-indigo-700">
                    {category?.name || "Untitled category"}
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">
                    {category?.description || defaultDescription}
                  </p>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
