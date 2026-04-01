"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import FaqAccordion from "@/app/_components/help/FaqAccordion";
import { getFaqsByCategorySlug } from "@/services/help.service";

export default function HelpCategoryPage() {
  const params = useParams();
  const categorySlug = params?.category;

  const [category, setCategory] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchCategoryFaqs() {
      if (!categorySlug) return;
      setLoading(true);
      setError("");
      try {
        const res = await getFaqsByCategorySlug(categorySlug);
        const data = res?.data?.data || {};
        const categoryData = data?.category || null;
        const faqList = Array.isArray(data?.faqs) ? data.faqs : [];

        if (!cancelled) {
          setCategory(categoryData);
          setFaqs(faqList);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(
            fetchError?.response?.data?.message || "Failed to load FAQs.",
          );
          setCategory(null);
          setFaqs([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchCategoryFaqs();

    return () => {
      cancelled = true;
    };
  }, [categorySlug]);

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="mx-auto w-full max-w-4xl px-4 py-10">
        <Link
          href="/help"
          className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-indigo-700 hover:text-indigo-800"
        >
          <ArrowLeft size={16} />
          Back to Help Center
        </Link>

        <header className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            {category?.name || "FAQs"}
          </h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            {category?.description || "Frequently asked questions and answers."}
          </p>
        </header>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-16 animate-pulse rounded-2xl border border-gray-200 bg-white"
              />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : faqs.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white px-4 py-6 text-sm text-gray-600">
            No FAQs found for this category yet.
          </div>
        ) : (
          <FaqAccordion items={faqs} />
        )}
      </main>
    </div>
  );
}
