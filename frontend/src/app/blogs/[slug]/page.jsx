"use client";
import { getBlogBySlug } from "@/services/blog.service";
import { useParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

const escapeHtml = (value = "") =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const formatBlogContent = (rawContent = "") => {
  if (!rawContent || typeof rawContent !== "string") return "";

  // If content already contains real HTML tags, render it as-is.
  if (/<\s*[a-z][^>]*>/i.test(rawContent)) {
    return rawContent;
  }

  const lines = rawContent
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (/^###\s+/.test(line)) {
      blocks.push(`<h3>${escapeHtml(line.replace(/^###\s+/, ""))}</h3>`);
      i += 1;
      continue;
    }

    if (/^##\s+/.test(line)) {
      blocks.push(`<h2>${escapeHtml(line.replace(/^##\s+/, ""))}</h2>`);
      i += 1;
      continue;
    }

    if (/^#\s+/.test(line)) {
      blocks.push(`<h1>${escapeHtml(line.replace(/^#\s+/, ""))}</h1>`);
      i += 1;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      const items = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i])) {
        items.push(`<li>${escapeHtml(lines[i].replace(/^[-*]\s+/, ""))}</li>`);
        i += 1;
      }
      blocks.push(`<ul>${items.join("")}</ul>`);
      continue;
    }

    // Heuristic: short standalone title-like line becomes heading.
    if (line.length <= 80 && !/[.!?]$/.test(line) && !/:$/.test(line)) {
      const next = lines[i + 1];
      if (next && !/^[-*#]/.test(next)) {
        blocks.push(`<h2>${escapeHtml(line)}</h2>`);
        i += 1;
        continue;
      }
    }

    blocks.push(`<p>${escapeHtml(line)}</p>`);
    i += 1;
  }

  return blocks.join("\n");
};

const SingleBlogPage = () => {
  const params = useParams();
  const slug = params?.slug;
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const res = await getBlogBySlug(slug);
        setBlog(res?.data?.data || null);
      } catch (error) {
        toast.error(error?.message || "Failed to fetch blog");
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  const publishedDate = useMemo(() => {
    const rawDate = blog?.createdAt || blog?.updatedAt;
    if (!rawDate) return "";
    const date = new Date(rawDate);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(date);
  }, [blog]);

  const renderedContent = useMemo(
    () => formatBlogContent(blog?.content || ""),
    [blog?.content],
  );

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-4">
          <Link
            href="/blogs"
            className="inline-flex items-center text-sm font-semibold text-[#5B4FE9] hover:underline"
          >
            ← Back to blogs
          </Link>
        </div>

        {loading ? (
          <div className="rounded-2xl border border-gray-200 bg-white py-20 text-center text-gray-500 font-medium">
            Loading blog...
          </div>
        ) : !blog ? (
          <div className="rounded-2xl border border-gray-200 bg-white py-20 text-center">
            <h2 className="text-xl font-bold text-gray-900">Blog not found</h2>
            <p className="mt-2 text-sm text-gray-600">
              This post may have been removed or the link is invalid.
            </p>
          </div>
        ) : (
          <>
            <header className="mb-8">
              <h1 className="text-3xl md:text-5xl font-black leading-tight text-gray-900">
                {blog.title}
              </h1>
              {publishedDate && (
                <p className="mt-4 text-sm font-medium text-gray-500">
                  Published on {publishedDate}
                </p>
              )}
            </header>

            <div className="mb-15 overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <Image
                src={blog?.thumbnail?.url || "/images/blog-placeholder.jpg"}
                alt={blog?.title || "Blog Thumbnail"}
                width={1400}
                height={700}
                className="h-[260px] w-full object-cover sm:h-[360px] md:h-[460px]"
                priority
              />
            </div>

            <article>
              <div
                className="max-w-none text-gray-700 leading-8 [&_h1]:mt-8 [&_h1]:mb-4 [&_h1]:text-3xl [&_h1]:font-black [&_h1]:leading-tight [&_h1]:text-gray-900 [&_h2]:mt-7 [&_h2]:mb-3 [&_h2]:text-2xl [&_h2]:font-extrabold [&_h2]:leading-snug [&_h2]:text-gray-900 [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:text-gray-900 [&_p]:mb-4 [&_p]:text-[17px] [&_p]:leading-8 [&_p]:text-gray-700 [&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-6 [&_li]:mb-2 [&_li]:text-gray-700 [&_a]:font-semibold [&_a]:text-[#5B4FE9] hover:[&_a]:underline [&_strong]:font-bold [&_strong]:text-gray-900 [&_blockquote]:my-5 [&_blockquote]:border-l-4 [&_blockquote]:border-[#5B4FE9] [&_blockquote]:pl-4 [&_blockquote]:italic [&_img]:my-6 [&_img]:rounded-xl"
                dangerouslySetInnerHTML={{ __html: renderedContent }}
              />
            </article>

            <div className="mt-10 border-t border-gray-200 py-10 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Explore more blogs
              </h3>
              <Link
                href="/blogs"
                className="inline-flex items-center text-[#5B4FE9] font-semibold hover:underline"
              >
                View all blogs →
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
};

export default SingleBlogPage;