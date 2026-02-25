"use client";

import { useListBusiness } from "@/context/ListBusinessContext";
import Image from "next/image";
import { Camera, Plus, Video, X } from "lucide-react";

export default function ShowcaseStep() {
  const {
    formData,
    addFiles,
    removeFile,
    updateFormData,
    errors,
    setErrors,
    modalMode,
    existingMediaCounts,
  } = useListBusiness();

  const photos = formData.photos || [];
  const videos = formData.videos || [];

  const setField = (key, value) => {
    updateFormData({ [key]: value });
    if (errors?.[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  return (
    <div className="space-y-5">
      {modalMode === "edit" && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs text-indigo-700">
          Existing media: {existingMediaCounts?.photos || 0} photos,{" "}
          {existingMediaCounts?.videos || 0} videos. New uploads are added to these.
        </div>
      )}

      <div>
        <p className="text-sm mb-2 font-semibold text-gray-900">Photos (minimum 3)</p>
        <div className="grid grid-cols-2 px-1 gap-3 sm:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => {
            const file = photos[index];
            return (
              <div
                key={index}
                className={`relative flex h-28 flex-col items-center justify-center rounded-2xl border-2 border-dashed transition ${
                  file
                    ? "border-indigo-300 bg-indigo-50/40"
                    : "border-gray-300 bg-white hover:border-purple-400 hover:bg-purple-50/40"
                }`}
                onClick={() => {
                  if (!file) document.getElementById(`photo-${index}`)?.click();
                }}
              >
                {file ? (
                  <>
                    <Image
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      width={300}
                      height={300}
                      className="h-full w-full rounded-xl object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile("photos", index);
                      }}
                      className="absolute right-2 top-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white shadow-sm"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                      <Camera size={18} />
                    </div>
                    <p className="text-xs font-semibold text-gray-600">Add Photo</p>
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                      <Plus size={10} />
                      Upload
                    </span>
                  </>
                )}

                <input
                  id={`photo-${index}`}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => addFiles("photos", e.target.files)}
                />
              </div>
            );
          })}
        </div>
        {errors?.photos && <p className="mt-2 text-xs text-rose-600">{errors.photos}</p>}
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-gray-900">Videos (optional)</p>
        <div className="grid grid-cols-2 gap-3 px-1">
          {Array.from({ length: 2 }).map((_, index) => {
            const file = videos[index];
            return (
              <div
                key={index}
                className={`relative flex h-28 flex-col items-center justify-center rounded-2xl border-2 border-dashed transition ${
                  file
                    ? "border-indigo-300 bg-indigo-50/40"
                    : "border-gray-300 bg-white hover:border-purple-400 hover:bg-purple-50/40"
                }`}
                onClick={() => {
                  if (!file) document.getElementById(`video-${index}`)?.click();
                }}
              >
                {file ? (
                  <>
                    <video src={URL.createObjectURL(file)} className="h-full w-full rounded-xl object-cover" />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile("videos", index);
                      }}
                      className="absolute right-2 top-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-red-500 text-white shadow-sm"
                    >
                      <X size={14} />
                    </button>
                  </>
                ) : (
                  <>
                    <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                      <Video size={18} />
                    </div>
                    <p className="text-xs font-semibold text-gray-600">Add Video</p>
                    <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-medium text-gray-500">
                      <Plus size={10} />
                      Upload
                    </span>
                  </>
                )}

                <input
                  id={`video-${index}`}
                  type="file"
                  accept="video/*"
                  hidden
                  onChange={(e) => addFiles("videos", e.target.files)}
                />
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block mb-2 text-sm font-semibold text-gray-900">Hourly Rate *</label>
        <div
          className={`flex items-center rounded-xl border px-4 py-2 ${
            errors?.hourlyRate
              ? "border-rose-400 ring-2 ring-rose-100"
              : "border-gray-300 focus-within:border-purple-500"
          }`}
        >
          <span className="text-gray-500">$</span>
          <input
            type="number"
            min="0"
            value={formData.hourlyRate}
            onChange={(e) => setField("hourlyRate", e.target.value)}
            className="mx-2 text-gray-800 w-full bg-transparent outline-none"
            placeholder="e.g. 45"
          />
          <span className="text-gray-500">/hour</span>
        </div>
        {errors?.hourlyRate && (
          <p className="mt-1 text-xs text-rose-600">{errors.hourlyRate}</p>
        )}
      </div>
    </div>
  );
}
