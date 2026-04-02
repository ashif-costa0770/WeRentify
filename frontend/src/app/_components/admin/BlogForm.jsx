"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { FileImage, Loader2 } from "lucide-react";
import RichTextEditor from "../tiptap-editor/RichTextEditor";
import { createBlogSchema } from "@/validations/blog.schema";

const inputClass =
  "w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-[#5B4FE9]/40 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]/20";

const labelClass = "mb-1.5 block text-sm font-semibold text-gray-800";

const htmlToText = (value) =>
  String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();

export default function BlogForm({
  initialData = {},
  onSubmit,
  isEdit = false,
}) {
  const [form, setForm] = useState({
    title: initialData.title || "",
    content: initialData.content || "",
    status: initialData.status || "draft",
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [preview, setPreview] = useState(initialData.thumbnail?.url || null);
  const [loading, setLoading] = useState(false);


  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    setThumbnail(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const clearThumbnail = () => {
    if (preview && preview.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }
    setThumbnail(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const titleText = String(form.title || "").trim();
    const contentText = htmlToText(form.content);
    const statusValue = form.status;
    const hasExistingThumbnail = Boolean(
      initialData?.thumbnail?.url || initialData?.thumbnail?.public_id,
    );

    // Handle truly empty form submissions early (especially editor HTML like "<p></p>")
    if (!titleText) {
      toast.error("Title is required");
      setLoading(false);
      return;
    }
    if (!contentText) {
      toast.error("Content is required");
      setLoading(false);
      return;
    }

    if (!["draft", "published"].includes(statusValue)) {
      toast.error("Status is required");
      setLoading(false);
      return;
    }

    const validatedData = createBlogSchema.safeParse(form);
    if (!validatedData.success) {
      const { fieldErrors } = validatedData.error.flatten();
      const firstFieldError =
        fieldErrors?.title?.[0] ||
        fieldErrors?.content?.[0] ||
        fieldErrors?.status?.[0] ||
        validatedData.error.issues?.[0]?.message ||
        "Please check your blog details.";

      toast.error(firstFieldError);
      setLoading(false);
      return;
    }

    if (!thumbnail && !hasExistingThumbnail) {
      toast.error("Thumbnail is required");
      setLoading(false);
      return;
    }
    try {
      const payload = new FormData();
      payload.append("title", form.title.trim());
      payload.append("content", form.content);
      payload.append("status", form.status);

      if (thumbnail) {
        payload.append("thumbnail", thumbnail);
      }

      await onSubmit(payload);
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Failed to save blog";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto max-w-3xl space-y-8 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8"
    >
     

      <div className="space-y-6">
        <div>
          <label htmlFor="title" className={labelClass}>
            Title <span className="font-normal text-rose-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="e.g. Why renting is better than buying"
            className={inputClass}
            
          />
        </div>

        <div>
          <label htmlFor="content" className={labelClass}>
            Content <span className="font-normal text-rose-500">*</span>
          </label>
          <p className="mb-2 text-xs text-gray-500">
            Use headings and formatting for a clear reading experience on the
            public blog.
          </p>
          <div className="overflow-hidden rounded-xl bg-gray-50/50">
            <RichTextEditor
              value={form.content}
              onChange={(content) => setForm({ ...form, content })}
              placeholder="Write your article…"
            />
          </div>
        </div>

        <div>
          <label htmlFor="thumbnail" className={labelClass}>
            Thumbnail <span className="font-normal text-rose-500">*</span>
          </label>                
           
            <input
              type="file"
              name="thumbnail"
              id="thumbnail"
              accept="image/*"
              onChange={handleImageChange}
              className="sr-only"
            />
            <label
              htmlFor="thumbnail"
              className="group relative flex min-h-[220px] cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/80 px-4 py-8 transition-colors hover:border-[#5B4FE9]/30 hover:bg-[#5B4FE9]/[0.03] sm:min-h-[200px]"
            >
              {preview ? (
                <>
                  <div className="absolute inset-0">
                    <Image
                      src={preview}
                      alt="Thumbnail preview"
                      fill
                      className="object-cover"
                      sizes="(min-width: 1024px) 720px, 100vw"
                    />
                    <div className="absolute h-full inset-0 bg-black/35 transition-opacity group-hover:bg-black/45" />
                  </div>

                  <div className="relative z-10 flex w-full items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white">
                        Thumbnail selected
                      </p>
                      <p className="mt-0.5 text-xs text-white/85">
                        Click to change image
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        clearThumbnail();
                      }}
                      className="shrink-0 cursor-pointer rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-rose-600 shadow-sm hover:bg-white"
                    >
                      Remove
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <FileImage
                    className="h-8 w-8 text-gray-400"
                    strokeWidth={1.5}
                  />
                  <span className="text-sm font-medium text-gray-600">
                    Click to upload or drag file here
                  </span>
                  <span className="mt-0.5 text-xs text-gray-400">
                    PNG or JPG recommended
                  </span>
                </>
              )}
            </label>
        </div>

        <div>
          <label htmlFor="status" className={labelClass}>
            Status <span className="font-normal text-rose-500">*</span>
          </label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={handleChange}
            className={inputClass}
          >
            <option value="draft">Draft — not visible on the public blog</option>
            <option value="published">Published — visible to everyone</option>
          </select>
        </div>
      </div>

      <div className="border-t border-gray-100 pt-6">
        <button
          type="submit"
          disabled={loading}
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#5B4FE9] to-[#9333ea] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : isEdit ? (
            "Update blog"
          ) : (
            "Create blog"
          )}
        </button>
      </div>
    </form>
  );
}
