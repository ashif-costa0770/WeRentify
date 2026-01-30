"use client";

import { useListBusiness } from "@/context/ListBusinessContext";

export default function ShowcaseStep() {
  const {
    formData,
    addFiles,
    removeFile,
    updateFormData
  } = useListBusiness();

  const photos = formData.photos || [];
  const videos = formData.videos || [];

  return (
    <div className="space-y-1  ">
      {/* HEADER */}
      <div>
        <h2 className="text-lg mt-2 font-bold text-gray-900">
          Showcase Your Work
        </h2>
        <p className="text-sm text-gray-500">
          Add photos, videos, and set your rate
        </p>
      </div>

      {/* PHOTOS */}
      <div>
        <p className=" text-sm font-semibold text-gray-900">
          Photos (minimum 3)
        </p>

        <div className="grid grid-cols-3  px-4 gap-4">
          {Array.from({ length: 6 }).map((_, index) => {
            const file = photos[index];

            return (
              <div
                key={index}
                className={`
                  relative flex flex-col items-center justify-center
                  h-22 rounded-xl border-2 border-dashed cursor-pointer
                  ${file ? "bg-gray-50 border-gray-300" : "border-gray-300"}
                `}
                onClick={() => {
                  if (!file) {
                    document.getElementById(`photo-${index}`).click();
                  }
                }}
              >
                {file ? (
                  <>
                    <img
                      src={URL.createObjectURL(file)}
                      alt="preview"
                      className="h-full w-full rounded-xl object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile("photos", index);
                      }}
                      className="absolute top-2 right-2 cursor-pointer rounded-full bg-red-400 text-white text-xs w-5 h-5 flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-2xl mb-1">📷</div>
                    <p className="text-sm text-gray-500">Add Photo</p>
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
      </div>

      {/* VIDEOS */}
      <div>
        <p className="mb-2 text-sm font-semibold text-gray-900">
          Videos (Optional)
        </p>

        <div className="grid grid-cols-2 px-4 gap-4">
          {Array.from({ length: 2 }).map((_, index) => {
            const file = videos[index];

            return (
              <div
                key={index}
                className={`
                  relative flex flex-col items-center justify-center
                  h-22 rounded-xl border-2 border-dashed cursor-pointer
                  ${file ? "bg-gray-50 border-transparent" : "border-gray-300"}
                `}
                onClick={() => {
                  if (!file) {
                    document.getElementById(`video-${index}`).click();
                  }
                }}
              >
                {file ? (
                  <>
                    <video
                      src={URL.createObjectURL(file)}
                      className="h-full w-full rounded-xl object-cover"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile("videos", index);
                      }}
                      className="absolute top-2 right-2 cursor-pointer rounded-full bg-red-400 text-white text-xs w-5 h-5 flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </>
                ) : (
                  <>
                    <div className="text-2xl mb-1">🎥</div>
                    <p className="text-sm text-gray-500">Add Video</p>
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

      {/* HOURLY RATE */}
      <div>
        <label className="block mb-2 text-sm font-semibold text-gray-900">
          Hourly Rate *
        </label>

        <div className="flex items-center rounded-xl border border-gray-300 px-4 py-1">
          <span className="text-gray-500">$</span>
          <input
            type="number"
            min="0"
            value={formData.hourlyRate}
            onChange={(e) =>
              updateFormData({ hourlyRate: e.target.value })
            }
            className="mx-2 text-gray-800 w-full outline-none  "
          />
          <span className="text-gray-500">/hour</span>
        </div>
      </div>
    </div>
  );
}
