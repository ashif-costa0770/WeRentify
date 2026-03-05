"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import { getPostsByUser, deletePost } from "@/services/post.service";
import PostsGrid from "@/app/community/_components/PostsGrid";
import ConfirmDeleteModal from "@/app/_components/modals/confirmDeleteModal";

const CreatePostModal = dynamic(
  () => import("@/app/community/_components/modals/CreatePostModal"),
  { ssr: false },
);

export default function MyPosts() {
  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const loadPosts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const res = await getPostsByUser();
      const payload = res?.data;
      const nested = payload?.data;

      const list =
        Array.isArray(nested) && nested.length
          ? nested
          : Array.isArray(payload?.posts)
            ? payload.posts
            : Array.isArray(nested?.posts)
              ? nested.posts
              : [];

      setPosts(list);
    } catch (err) {
      if (Number(err?.response?.status) === 404) {
        setPosts([]);
        return;
      }

      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to load your posts";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const handleUpdatePost = (updated) => {
    setPosts((prev) =>
      prev.map((post) => (post._id === updated._id ? updated : post)),
    );
  };

  const handleEditPost = (post) => {
    setEditingPost(post);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (post) => {
    setDeleteTarget(post);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?._id) return;
    try {
      setIsDeleting(true);
      await deletePost(deleteTarget._id);
      setPosts((prev) =>
        prev.filter((p) => String(p._id) !== String(deleteTarget._id)),
      );
      toast.success("Post deleted successfully");
      setDeleteTarget(null);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Failed to delete post";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white py-16 text-center shadow-sm">
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading your posts...
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold text-gray-900">My Posts</h2>
              <span className="rounded-full bg-indigo-50 px-3 py-1 mt-1 text-xs font-semibold text-indigo-700 shadow-sm">
                {posts.length} Total
              </span>
            </div>
            <p className="text-sm text-gray-500">
              View and manage the posts you&apos;ve created in the community.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setEditingPost(null);
              setIsEditModalOpen(true);
            }}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-[#5B4FE9] to-[#E95FC8] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md active:scale-95"
          >
            <span className="text-base leading-none">＋</span>
            <span>Add Post</span>
          </button>
        </div>
      </section>

      {error ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700 shadow-sm">
          {error}
        </section>
      ) : null}

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <PostsGrid
          posts={posts}
          currentUser={user}
          onUpdatePost={handleUpdatePost}
          variant="my-posts"
          onEditPost={handleEditPost}
          onDeletePost={handleDeleteClick}
        />
      </section>

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        title="Delete post"
        message={
          deleteTarget
            ? `Are you sure you want to delete "${deleteTarget.title}"? This action cannot be undone.`
            : "Are you sure you want to delete this post?"
        }
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        isLoading={isDeleting}
        onClose={() => {
          if (isDeleting) return;
          setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      <CreatePostModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingPost(null);
        }}
        onSubmit={loadPosts}
        initialPost={editingPost}
      />
    </div>
  );
}
