"use client";

import React from "react";
import BlogForm from "@/app/_components/admin/BlogForm";
import { getBlogBySlug, updateBlog } from "@/services/blog.service";
import { toast } from "sonner";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const EditBlogPage = () => {
  const params = useParams();
  const slug = params?.id;
  const router = useRouter();

  const [blog, setBlog] = useState(null);

  //Fetch blog details
  useEffect(() => {
    console.log("slug", slug);
    if (!slug) return;
    
    const fetchBlog = async () => {
      try {
        const res = await getBlogBySlug(slug);
        setBlog(res?.data?.data || null);
      } catch (error) {
        const message =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Failed to load blog details";
        toast.error(message);
      }
    };
    fetchBlog();
  }, [slug]);

  //Handle update blog
  const handleUpdateBlog = async (data) => {
    if (!blog?._id) return;
    try {
      const res = await updateBlog(blog?._id, data);
      if (res.data.success) {
        toast.success(res?.data?.message || "Blog updated successfully");
      }
      router.push("/admin/blogs");
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to update blog";

      toast.error(message);
    }
  };

  if (!blog) return <div>Loading...</div>;

  return (
    <section className="space-y-6">
      <div className="text-center py-2">
        <h1 className="text-2xl font-semibold text-slate-800">Edit Blog</h1>
        <p className="mt-1 text-sm text-slate-500">
          Edit the blog post using the editor, update the thumbnail, and choose
          draft or published.
        </p>
      </div>

      <BlogForm onSubmit={handleUpdateBlog} initialData={blog} isEdit={true} />
    </section>
  );
};

export default EditBlogPage;
