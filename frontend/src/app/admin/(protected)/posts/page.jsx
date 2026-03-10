"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";

import PostsTable from "./components/posts-table";
import { getPostsColumns } from "./components/posts-columns";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "/backend-api").replace(
  /\/+$/,
  ""
);

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    pages: 1,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    async function fetchPosts() {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "10",
          search,
        });
        const res = await fetch(`${API_URL}/admin/posts?${params.toString()}`, {
          credentials: "include",
          cache: "no-store",
        });
        const payload = await res.json().catch(() => null);

        if (!res.ok || !payload?.success) {
          throw new Error(payload?.message || "Failed to fetch posts");
        }

        if (cancelled) return;

        const rows = Array.isArray(payload?.data?.posts)
          ? payload.data.posts
          : Array.isArray(payload?.data)
            ? payload.data
            : [];
        const nextPagination = payload?.data?.pagination || payload?.pagination || {};

        setPosts(rows);
        setPagination({
          total: nextPagination?.total ?? rows.length,
          page: nextPagination?.page ?? page,
          pages: Math.max(nextPagination?.pages ?? 1, 1),
        });
      } catch (fetchError) {
        if (!cancelled) {
          setPosts([]);
          setError(fetchError.message || "Failed to fetch posts");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchPosts();
    return () => {
      cancelled = true;
    };
  }, [page, search]);

  const currentPage = pagination.page || page;
  const totalPages = pagination.pages || 1;
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  const handleDeletePost = async (postId) => {
    const previousPosts = posts;
    const previousPagination = pagination;
    const postExists = previousPosts.some((item) => item?._id === postId);
    if (!postExists) return;

    setError("");
    setActionLoadingId(postId);

    setPosts((prev) => prev.filter((item) => item?._id !== postId));
    setPagination((prev) => ({
      ...prev,
      total: Math.max((prev?.total ?? 0) - 1, 0),
    }));

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
    } catch (actionError) {
      setPosts(previousPosts);
      setPagination(previousPagination);
      setError(actionError.message || "Failed to delete post");
      toast.error(actionError.message || "Failed to delete post");
    } finally {
      setActionLoadingId(null);
    }
  };

  const columns = getPostsColumns({
    deletingId: actionLoadingId,
    onDelete: handleDeletePost,
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-800">Posts</h1>
          <p className="mt-1 text-sm text-slate-500">Manage and moderate community posts</p>
        </div>
        <div className="relative w-full md:w-[280px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search posts..."
            className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <PostsTable
        columns={columns}
        data={posts}
        loading={loading}
        sorting={sorting}
        onSortingChange={setSorting}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        currentPage={currentPage}
        totalPages={totalPages}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        onPreviousPage={() => setPage((prev) => Math.max(prev - 1, 1))}
        onNextPage={() =>
          setPage((prev) => Math.min(prev + 1, pagination.pages || prev + 1))
        }
      />
    </section>
  );
}
