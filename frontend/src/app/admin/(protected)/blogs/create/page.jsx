"use client";
import React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import BlogForm from "@/app/_components/admin/BlogForm";
import { createBlog } from "@/services/blog.service";

const CreateBlogPage = () => {
  const router = useRouter();
  const handleCreateBlog = async (data) => {
    try {
      const res = await createBlog(data);
      if (res.data.success) {
        toast.success(res.data.message || "Blog created successfully");
        router.push(`/admin/blogs`);
      }
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to create blog";
      toast.error(message);
    }
  };
  return (
    <section className="space-y-6">
      <div className="text-center py-2">
        <h1 className="text-2xl font-semibold text-slate-800">Create Blog</h1>
        <p className="mt-1 text-sm text-slate-500">
          Write a new blog post using the editor, add a thumbnail, and choose
          draft or published.
        </p>
      </div>

      <BlogForm onSubmit={handleCreateBlog} />
    </section>
  );
};

export default CreateBlogPage;
