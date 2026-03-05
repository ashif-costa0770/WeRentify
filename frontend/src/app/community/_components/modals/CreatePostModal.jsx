"use client";

import Image from "next/image";
import { createPost, updatePost } from "@/services/post.service";
import { toast } from "sonner";
import { useEffect, useMemo, useRef, useState } from "react";
import { X, Wrench, Package, Camera, Calendar } from "lucide-react";
import RichTextEditor from "@/app/_components/tiptap-editor/RichTextEditor";

const MAX_PHOTO_SIZE_MB = 5;

const emptyForm = {
  type: "service",
  title: "",
  description: "",
  category: "",
  city: "",
  state: "",
  dateNeeded: "",
  budget: "",
  photos: [],
};

const emptyPreviews = [null, null, null];

function stripHtml(value = "") {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function todayLocalISO() {
  const now = new Date();
  const tz = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - tz).toISOString().slice(0, 10);
}

export default function CreatePostModal({
  isOpen,
  onClose,
  onSubmit,
  initialPost = null,
}) {
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [photoPreviews, setPhotoPreviews] = useState(emptyPreviews);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRefs = [useRef(null), useRef(null), useRef(null)];

  const minDate = useMemo(() => todayLocalISO(), []);
  const isEditMode = Boolean(initialPost?._id);

  useEffect(() => {
    // Sync form when an initialPost is provided (edit mode)
    if (initialPost && initialPost._id) {
      const [city = "", state = ""] = (initialPost.location || "")
        .split(",")
        .map((part) => part.trim());

      setFormData({
        type: initialPost.type || "service",
        title: initialPost.title || "",
        description: initialPost.description || "",
        category: initialPost.category || "",
        city,
        state,
        dateNeeded: initialPost.dateNeeded
          ? String(initialPost.dateNeeded).slice(0, 10)
          : "",
        budget: initialPost.budget || "",
        photos: [],
      });
      setErrors({});
      setPhotoPreviews(emptyPreviews);
    }

    // When the modal is fully closed and there's no initial post, reset to empty
    if (!isOpen && !initialPost) {
      setFormData(emptyForm);
      setErrors({});
      setPhotoPreviews(emptyPreviews);
    }
  }, [initialPost, isOpen]);

  if (!isOpen) return null;

  const closeAndReset = () => {
    setFormData(emptyForm);
    setErrors({});
    setPhotoPreviews(emptyPreviews);
    onClose();
  };

  const setField = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleTypeSelect = (type) => {
    setField("type", type);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setField(name, value);
  };

  const handleDescriptionChange = (content) => {
    setField("description", content);
  };

  const handlePhotoClick = (index) => {
    fileInputRefs[index].current?.click();
  };

  const handleFileChange = (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isSizeValid = file.size <= MAX_PHOTO_SIZE_MB * 1024 * 1024;

    if (!isImage) {
      toast.error("Please upload a valid image file.");
      return;
    }

    if (!isSizeValid) {
      toast.error(`Photo size must be ${MAX_PHOTO_SIZE_MB}MB or less.`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const newPreviews = [...photoPreviews];
      newPreviews[index] = reader.result;
      setPhotoPreviews(newPreviews);

      const newPhotos = [...formData.photos];
      newPhotos[index] = file;
      setField("photos", newPhotos);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = (index) => {
    const newPreviews = [...photoPreviews];
    newPreviews[index] = null;
    setPhotoPreviews(newPreviews);

    const newPhotos = [...formData.photos];
    newPhotos[index] = null;
    setField("photos", newPhotos);
  };

  const validateForm = () => {
    const nextErrors = {};
    const cleanDescription = stripHtml(formData.description);

    if (!formData.type || !["service", "item"].includes(formData.type)) {
      nextErrors.type = "Please choose request type.";
    }

    if (!formData.title.trim()) {
      nextErrors.title = "Title is required.";
    } else if (formData.title.trim().length < 8) {
      nextErrors.title = "Title should be at least 8 characters.";
    }

    if (!cleanDescription) {
      nextErrors.description = "Description is required.";
    } else if (cleanDescription.length < 20) {
      nextErrors.description = "Description should be at least 20 characters.";
    }

    if (!formData.category.trim()) {
      nextErrors.category = "Category is required.";
    }

    if (!formData.city.trim()) {
      nextErrors.city = "City is required.";
    }

    if (!formData.state.trim()) {
      nextErrors.state = "State is required.";
    }

    if (!formData.dateNeeded) {
      nextErrors.dateNeeded = "Date needed is required.";
    } else if (formData.dateNeeded < minDate) {
      nextErrors.dateNeeded = "Date needed cannot be in the past.";
    }

    if (formData.budget.trim().length > 60) {
      nextErrors.budget = "Budget should be under 60 characters.";
    }

    const validPhotos = formData.photos.filter(Boolean);
    if (validPhotos.some((file) => !file.type.startsWith("image/"))) {
      nextErrors.photos = "Only image files are allowed.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!validateForm()) {
      toast.error("Please fix the highlighted fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("type", formData.type);
      payload.append("title", formData.title.trim());
      payload.append("description", formData.description);
      payload.append("category", formData.category.trim());
      payload.append(
        "location",
        `${formData.city.trim()}, ${formData.state.trim()}`,
      );
      payload.append("dateNeeded", formData.dateNeeded);
      payload.append("budget", formData.budget.trim());

      formData.photos.forEach((file) => {
        if (file) payload.append("photos", file);
      });
      if (isEditMode && initialPost?._id) {
        await updatePost(initialPost._id, payload);
        toast.success("Post updated successfully!");
      } else {
        await createPost(payload);
        toast.success("Post created successfully!");
      }

      if (onSubmit) await onSubmit();
      closeAndReset();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.errors ||
        err.message ||
        "Failed to create post";
      toast.error(
        "Failed to create post: " +
          (typeof msg === "string" ? msg : JSON.stringify(msg)),
      );
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm sm:p-4">
      <div className="relative flex h-[92dvh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl sm:h-auto sm:max-h-[92vh]">
        <div className="shrink-0 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-pink-50 px-5 py-4 sm:px-8 sm:py-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black bg-gradient-to-r from-[#5B4FE9] to-[#E95FC8] bg-clip-text text-transparent sm:text-3xl">
                {isEditMode ? "Edit Post" : "Create Post"}
              </h2>
              <p className="mt-1 text-sm text-gray-600">
                {isEditMode
                  ? "Update your community request details"
                  : "Request a service or item from your community"}
              </p>
            </div>
            <button
              onClick={closeAndReset}
              className="rounded-full cursor-pointer p-2 transition-colors hover:bg-white/80"
              aria-label="Close"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-8 sm:py-6"
        >
          <div className="space-y-6">
            <div>
              <label className="mb-3 block text-sm font-bold text-gray-900">
                What are you looking for?{" "}
                <span className="text-rose-500">*</span>
              </label>
              <div className="grid  grid-cols-1 gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleTypeSelect("service")}
                  className={`rounded-2xl border-2 cursor-pointer p-5 text-left transition-all ${
                    formData.type === "service"
                      ? "border-[#5B4FE9] bg-purple-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="mb-2 inline-flex rounded-full bg-white p-2 shadow-sm">
                    <Wrench className="h-5 w-5 text-[#5B4FE9]" />
                  </div>
                  <p className="font-bold text-gray-900">Service Request</p>
                  <p className="text-xs text-gray-500">
                    Photographer, makeup artist, etc.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleTypeSelect("item")}
                  className={`rounded-2xl border-2 cursor-pointer p-5 text-left transition-all ${
                    formData.type === "item"
                      ? "border-[#5B4FE9] bg-purple-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="mb-2 inline-flex rounded-full bg-white p-2 shadow-sm">
                    <Package className="h-5 w-5 text-[#5B4FE9]" />
                  </div>
                  <p className="font-bold text-gray-900">Item Request</p>
                  <p className="text-xs text-gray-500">
                    Power washer, camera, etc.
                  </p>
                </button>
              </div>
              {errors.type && (
                <p className="mt-1 text-xs text-rose-600">{errors.type}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-900">
                Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder={
                  formData.type === "item"
                    ? "e.g., Looking for power washer"
                    : "e.g., Need photographer for wedding"
                }
                className={`w-full rounded-xl border px-4 py-3 text-gray-700 transition-all placeholder:text-gray-400 focus:outline-none ${
                  errors.title
                    ? "border-rose-400 ring-2 ring-rose-100"
                    : "border-gray-200 focus:border-[#5B4FE9] focus:ring-2 focus:ring-purple-500/20"
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-rose-600">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-900">
                Description <span className="text-rose-500">*</span>
              </label>
              <div
                className={`${errors.description ? "rounded-xl ring-2 ring-rose-100" : ""}`}
              >
                <RichTextEditor
                  value={formData.description}
                  onChange={handleDescriptionChange}
                />
              </div>
              {errors.description ? (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.description}
                </p>
              ) : (
                <p className="mt-1 text-xs text-gray-500">
                  Minimum 20 characters.
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-900">
                Category <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="e.g. Photography, Beauty, Moving"
                className={`w-full rounded-xl border px-4 py-3 text-gray-700 transition-all placeholder:text-gray-400 focus:outline-none ${
                  errors.category
                    ? "border-rose-400 ring-2 ring-rose-100"
                    : "border-gray-200 focus:border-[#5B4FE9] focus:ring-2 focus:ring-purple-500/20"
                }`}
              />
              {errors.category && (
                <p className="mt-1 text-xs text-rose-600">{errors.category}</p>
              )}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-gray-900">
                  City <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Orlando"
                  className={`w-full rounded-xl border px-4 py-3 text-gray-700 transition-all placeholder:text-gray-400 focus:outline-none ${
                    errors.city
                      ? "border-rose-400 ring-2 ring-rose-100"
                      : "border-gray-200 focus:border-[#5B4FE9] focus:ring-2 focus:ring-purple-500/20"
                  }`}
                />
                {errors.city && (
                  <p className="mt-1 text-xs text-rose-600">{errors.city}</p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-gray-900">
                  State <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="FL"
                  className={`w-full rounded-xl border px-4 py-3 text-gray-700 transition-all placeholder:text-gray-400 focus:outline-none ${
                    errors.state
                      ? "border-rose-400 ring-2 ring-rose-100"
                      : "border-gray-200 focus:border-[#5B4FE9] focus:ring-2 focus:ring-purple-500/20"
                  }`}
                />
                {errors.state && (
                  <p className="mt-1 text-xs text-rose-600">{errors.state}</p>
                )}
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-900">
                Date Needed <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  name="dateNeeded"
                  value={formData.dateNeeded}
                  onChange={handleInputChange}
                  min={minDate}
                  className={`w-full rounded-xl border px-4 py-3 pr-11 text-gray-700 transition-all focus:outline-none ${
                    errors.dateNeeded
                      ? "border-rose-400 ring-2 ring-rose-100"
                      : "border-gray-200 focus:border-[#5B4FE9] focus:ring-2 focus:ring-purple-500/20"
                  }`}
                />
              </div>
              {errors.dateNeeded && (
                <p className="mt-1 text-xs text-rose-600">
                  {errors.dateNeeded}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-900">
                Budget (Optional)
              </label>
              <input
                type="text"
                name="budget"
                value={formData.budget}
                onChange={handleInputChange}
                placeholder="e.g. $500-800 or $50/day"
                className={`w-full rounded-xl border px-4 py-3 text-gray-700 transition-all placeholder:text-gray-400 focus:outline-none ${
                  errors.budget
                    ? "border-rose-400 ring-2 ring-rose-100"
                    : "border-gray-200 focus:border-[#5B4FE9] focus:ring-2 focus:ring-purple-500/20"
                }`}
              />
              {errors.budget && (
                <p className="mt-1 text-xs text-rose-600">{errors.budget}</p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-900">
                Photos (Optional)
              </label>
              <p className="mb-3 text-sm text-gray-500">
                Add photos to show examples of what you are looking for
              </p>
              <div className="grid  grid-cols-3 gap-3 sm:gap-4">
                {[0, 1, 2].map((index) => (
                  <div key={index} className="relative ">
                    <input
                      type="file"
                      ref={fileInputRefs[index]}
                      onChange={(e) => handleFileChange(e, index)}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => handlePhotoClick(index)}
                      className={`flex aspect-square cursor-pointer w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-xl border-2 border-dashed transition-all ${
                        photoPreviews[index]
                          ? "border-[#5B4FE9] bg-purple-50"
                          : "border-gray-300 bg-gray-50 hover:border-gray-400"
                      }`}
                    >
                      {photoPreviews[index] ? (
                        <>
                          <Image
                            src={photoPreviews[index]}
                            alt={`Preview ${index + 1}`}
                            width={400}
                            height={400}
                            className="h-full w-full object-cover"
                          />
                          <span
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemovePhoto(index);
                            }}
                            role="button"
                            tabIndex={0}
                            className="absolute -right-2 -top-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white shadow-md"
                          >
                            <X className="h-3.5 w-3.5" />
                          </span>
                        </>
                      ) : (
                        <>
                          <Camera className="h-7 w-7 text-gray-400" />
                          <span className="text-xs text-gray-500">
                            Add Photo
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
              {errors.photos && (
                <p className="mt-1 text-xs text-rose-600">{errors.photos}</p>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 mt-6 border border-gray-100 bg-white/95 py-4 backdrop-blur">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-[#5B4FE9] to-[#E95FC8] py-3.5 font-bold text-white transition-all duration-200 hover:shadow-lg hover:shadow-purple-500/25 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting
                ? isEditMode
                  ? "Updating..."
                  : "Posting..."
                : isEditMode
                  ? "Update Post"
                  : "Post to Community"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
