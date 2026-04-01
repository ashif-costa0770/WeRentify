"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import {
  deleteBlog,
  getBlogsForAdmin,
  toggleBlogStatus,
} from "@/services/blog.service";

import AdminGuard from "../AdminGuard";
import BlogsTable from "./components/blogs-table";
import { getBlogColumns } from "./components/blog-coloumn";

export default function BlogsPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState([]);
  const [deletingId, setDeletingId] = useState(null);
  const [togglingId, setTogglingId] = useState(null);

  const pageSize = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    let cancelled = false;

    async function fetchBlogs() {
      setLoading(true);
      setError("");
      try {
        const res = await getBlogsForAdmin();
        const payload = res?.data;
        const rows = Array.isArray(payload?.data?.blogs)
          ? payload.data.blogs
          : Array.isArray(payload?.data)
            ? payload.data
            : [];

        if (!cancelled) setBlogs(rows);
      } catch (fetchError) {
        if (!cancelled) {
          const message =
            fetchError?.response?.data?.message ||
            fetchError?.message ||
            "Failed to fetch blogs";
          setBlogs([]);
          setError(message);
          toast.error(message);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchBlogs();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredBlogs = useMemo(() => {
    const term = search.toLowerCase();
    if (!term) return blogs;

    return blogs.filter((blog) => {
      const title = String(blog?.title || "").toLowerCase();
      const content = String(blog?.content || "").toLowerCase();
      const status = String(blog?.status || "").toLowerCase();
      return (
        title.includes(term) ||
        content.includes(term) ||
        status.includes(term)
      );
    });
  }, [blogs, search]);

  const totalPages = Math.max(Math.ceil(filteredBlogs.length / pageSize), 1);

  useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

  const paginatedBlogs = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredBlogs.slice(start, start + pageSize);
  }, [filteredBlogs, page]);

  const handleDeleteBlog = async (blogId) => {
    const previousBlogs = blogs;
    const exists = previousBlogs.some((item) => item?._id === blogId);
    if (!exists) return;

    setDeletingId(blogId);
    setError("");
    setBlogs((prev) => prev.filter((item) => item?._id !== blogId));

    try {
      await deleteBlog(blogId);
      toast.success("Blog deleted successfully.");
    } catch (actionError) {
      setBlogs(previousBlogs);
      const message =
        actionError?.response?.data?.message ||
        actionError?.message ||
        "Failed to delete blog";
      setError(message);
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleBlogStatus = async (blogId) => {
    const previousBlogs = blogs;
    const targetBlog = previousBlogs.find((item) => item?._id === blogId);
    if (!targetBlog) return;

    const nextStatus =
      String(targetBlog.status || "").toLowerCase() === "published"
        ? "draft"
        : "published";

    setTogglingId(blogId);
    setError("");
    setBlogs((prev) =>
      prev.map((item) =>
        item?._id === blogId ? { ...item, status: nextStatus } : item,
      ),
    );

    try {
      const res = await toggleBlogStatus(blogId);
      const updatedBlog = res?.data?.data;
      if (updatedBlog?._id) {
        setBlogs((prev) =>
          prev.map((item) =>
            item?._id === blogId ? { ...item, ...updatedBlog } : item,
          ),
        );
      }
      toast.success(
        nextStatus === "published"
          ? "Blog published successfully."
          : "Blog moved to draft.",
      );
    } catch (actionError) {
      setBlogs(previousBlogs);
      const message =
        actionError?.response?.data?.message ||
        actionError?.message ||
        "Failed to update blog status";
      setError(message);
      toast.error(message);
    } finally {
      setTogglingId(null);
    }
  };

  const columns = useMemo(
    () =>
      getBlogColumns({
        deletingId,
        togglingId,
        onDelete: handleDeleteBlog,
        onToggleStatus: handleToggleBlogStatus,
      }),
    [deletingId, togglingId, handleDeleteBlog, handleToggleBlogStatus],
  );

  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  return (
    <AdminGuard>
      <section className="space-y-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800">Blogs</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage published and draft blogs.
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 md:w-auto md:flex-row md:items-center">
            <div className="relative w-full md:w-[280px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search blogs..."
                className="h-10 w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>
            <Button asChild className="cursor-pointer">
              <Link href="/admin/blogs/create">Create Blog</Link>
            </Button>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <BlogsTable
          columns={columns}
          data={paginatedBlogs}
          loading={loading}
          sorting={sorting}
          onSortingChange={setSorting}
          currentPage={page}
          totalPages={totalPages}
          canGoPrevious={canGoPrevious}
          canGoNext={canGoNext}
          onPreviousPage={() => setPage((prev) => Math.max(prev - 1, 1))}
          onNextPage={() => setPage((prev) => Math.min(prev + 1, totalPages))}
        />
      </section>
    </AdminGuard>
  );
}
