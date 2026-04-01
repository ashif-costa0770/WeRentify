"use client";
import { getBlogs } from "@/services/blog.service";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

const BlogsPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatBlogDate = (blog) => {
    const rawDate = blog?.createdAt || blog?.updatedAt;
    if (!rawDate) return null;

    const date = new Date(rawDate);
    if (Number.isNaN(date.getTime())) return null;

    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const res = await getBlogs();
        setBlogs(res.data.data.blogs);
      } catch (error) {
        toast.error(error.message || "Failed to fetch blogs");
        console.log(error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        <div className="mb-10 border-b border-gray-200 pb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5B4FE9]">
            WeRentify Blog
          </p>
          <h1 className="mt-2 text-3xl md:text-4xl font-black leading-tight text-gray-900">
            Insights for renters and hosts
          </h1>
          <p className="mt-3 max-w-2xl text-sm md:text-base text-gray-600 mx-auto">
            Fresh tips, how-to guides, and platform updates to help you make
            smarter rental decisions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 ">
        {loading ? (
          <div className="col-span-full rounded-2xl border border-gray-200 bg-white py-14 text-center text-gray-500 font-medium shadow-sm">
            Loading...
          </div>
        ) : blogs.length > 0 ? (
          blogs.map((blog) => (
            <Link
              href={`/blogs/${blog.slug}`}
              className="group mb-4 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-200 hover:shadow-md"
              key={blog._id}
            >
              <div className="relative aspect-[16/16] w-full overflow-hidden bg-gray-100">
                {blog.thumbnail?.url ? (
                  <Image
                    src={blog.thumbnail.url}
                    alt={blog.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    width={700}
                    height={440}
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-sm font-medium text-gray-400">
                    No image
                  </div>
                )}
              </div>
              <div className="p-4">
                {formatBlogDate(blog) && (
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-500">
                    {formatBlogDate(blog)}
                  </p>
                )}
                <h2 className="text-lg font-bold text-gray-800 line-clamp-2 group-hover:text-[#5B4FE9] transition-colors">
                  {blog.title}
                </h2>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full rounded-2xl border border-gray-200 bg-white py-14 text-center text-gray-500 font-medium shadow-sm">
            No blogs found
          </div>
        )}
        </div>
      </div>
    </main>
  );
};

export default BlogsPage;
