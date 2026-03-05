"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "/backend-api").replace(
  /\/+$/,
  ""
);

function formatDate(dateValue) {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function sanitizeHtmlText(value) {
  if (!value) return "";
  return String(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getTypeClass(type) {
  const value = String(type || "").toLowerCase();
  if (value === "service") return "bg-teal-100 text-teal-700";
  if (value === "item") return "bg-blue-100 text-blue-700";
  return "bg-slate-100 text-slate-700";
}

export default function PostDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params?.id;

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [post, setPost] = useState(null);

  useEffect(() => {
    if (!postId) return;

    let cancelled = false;

    async function fetchPostDetails() {
      setLoading(true);
      setError("");
      setNotFound(false);

      try {
        const res = await fetch(`${API_URL}/admin/posts/${postId}`, {
          credentials: "include",
          cache: "no-store",
        });
        const payload = await res.json().catch(() => null);

        if (!res.ok || !payload?.success || !payload?.data) {
          if (!cancelled) {
            if (res.status === 404) {
              setNotFound(true);
            } else {
              setError(payload?.message || "Failed to load post details");
            }
          }
          return;
        }

        if (!cancelled) {
          setPost(payload.data);
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError?.message || "Failed to load post details");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPostDetails();
    return () => {
      cancelled = true;
    };
  }, [postId]);

  const stats = useMemo(
    () => [
      { label: "Comments", value: post?.commentsCount ?? 0 },
      { label: "Likes", value: post?.likesCount ?? 0 },
      { label: "Saves", value: post?.savesCount ?? 0 },
    ],
    [post]
  );

  const normalizedDescription = sanitizeHtmlText(post?.description);

  const handleDeletePost = async () => {
    if (!postId) return;
    const confirmed = window.confirm(
      "Are you sure you want to delete this post? This action cannot be undone."
    );
    if (!confirmed) return;

    setActionLoading(true);
    setError("");

    try {
      const res = await fetch(`${API_URL}/admin/posts/${postId}`, {
        method: "DELETE",
        credentials: "include",
        cache: "no-store",
      });
      const payload = await res.json().catch(() => null);

      if (!res.ok || !payload?.success) {
        throw new Error(payload?.message || "Failed to delete post");
      }

      toast.success("Post deleted successfully.");
      router.replace("/admin/posts");
    } catch (deleteError) {
      setError(deleteError?.message || "Failed to delete post");
      toast.error(deleteError?.message || "Failed to delete post");
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center">
        <p className="text-slate-500">Loading post details...</p>
      </section>
    );
  }

  if (notFound || !post) {
    return (
      <section className="min-h-[60vh] flex items-center justify-center">
        <p className="text-slate-500 text-lg font-medium">Post not found</p>
      </section>
    );
  }

  return (
    <section className="space-y-6">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">{post.title || "Post"}</h1>
          <p className="mt-1 text-sm text-slate-500">Post ID: {post._id}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge className={getTypeClass(post.type)}>{String(post.type || "-").toUpperCase()}</Badge>
            <Badge className="bg-slate-200 text-slate-700">{String(post.category || "-").toUpperCase()}</Badge>
          </div>
        </div>
        <Button asChild variant="outline">
          <Link href="/admin/posts">Back to Posts</Link>
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Post Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Location</p>
            <p className="mt-1 font-medium text-slate-800">{post.location || "-"}</p>
          </div>
          <div>
            <p className="text-slate-500">Budget</p>
            <p className="mt-1 font-medium text-slate-800">{post.budget || "-"}</p>
          </div>
          <div>
            <p className="text-slate-500">Date Needed</p>
            <p className="mt-1 font-medium text-slate-800">{formatDate(post.dateNeeded)}</p>
          </div>
          <div>
            <p className="text-slate-500">Created</p>
            <p className="mt-1 font-medium text-slate-800">{formatDate(post.createdAt)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Author Information</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Author Name</p>
            <Link
              href={`/admin/users/${post?.author?._id}`}
              className="mt-1 inline-block font-medium text-indigo-700 hover:text-indigo-800 hover:underline"
            >
              {post?.author?.fullName || "-"}
            </Link>
          </div>
          <div>
            <p className="text-slate-500">Author Email</p>
            <p className="mt-1 font-medium text-slate-800">{post?.author?.email || "-"}</p>
          </div>
          <div>
            <p className="text-slate-500">Account Status</p>
            <p className="mt-1 font-medium text-slate-800">
              {post?.author?.isActive ? "Active" : "Suspended"}
            </p>
          </div>
          <div>
            <p className="text-slate-500">Joined</p>
            <p className="mt-1 font-medium text-slate-800">{formatDate(post?.author?.joinedAt)}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {stats.map((card) => (
          <div key={card.label} className="bg-white rounded-xl shadow-md p-6">
            <p className="text-xs uppercase tracking-wide text-slate-500 font-medium">{card.label}</p>
            <p className="text-3xl font-bold text-slate-900 mt-2">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-3">Description</h2>
        <p className="text-sm leading-6 text-slate-700 whitespace-pre-wrap">
          {normalizedDescription || "No description available."}
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">Photos</h2>
        {Array.isArray(post.photos) && post.photos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {post.photos.map((photo, idx) => (
              <div key={photo?.public_id || `photo-${idx}`} className="rounded-lg border border-slate-200 overflow-hidden">
                <img
                  src={photo?.url}
                  alt={`Post photo ${idx + 1}`}
                  className="h-48 w-full object-cover bg-slate-100"
                />
                <div className="px-3 py-2 text-xs text-slate-600">
                  <p>Format: {photo?.format || "-"}</p>
                  <p>
                    Size: {photo?.width || "-"} x {photo?.height || "-"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No photos available.</p>
        )}
      </div>

      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-red-700">Danger Zone</h2>
        <p className="mt-1 text-sm text-red-700/80">
          Deleting a post will also remove related comments and cannot be undone.
        </p>
        <Button
          type="button"
          variant="destructive"
          onClick={handleDeletePost}
          disabled={actionLoading}
          className="mt-4 cursor-pointer"
        >
          {actionLoading ? "Deleting..." : "Delete Post"}
        </Button>
      </div>
    </section>
  );
}
