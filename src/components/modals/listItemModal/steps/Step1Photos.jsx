"use client";
import Image from "next/image";

import { Camera, Video, X } from "lucide-react";

export default function Step1Photos({ 
  formData, 
  setFormData, 
  photoPreviews, 
  setPhotoPreviews, 
  videoPreviews, 
  setVideoPreviews, 
  videoFileNames, 
  setVideoFileNames, 
  photoInputRefs, 
  videoInputRefs 
}) {

  const handleFileChange = (e, index, type) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'photo') {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPreviews = [...photoPreviews];
        newPreviews[index] = reader.result;
        setPhotoPreviews(newPreviews);
        
        const newPhotos = [...formData.photos];
        newPhotos[index] = file;
        setFormData({ ...formData, photos: newPhotos });
      };
      reader.readAsDataURL(file);
    } else if (type === 'video') {
      const newVideos = [...formData.videos];
      newVideos[index] = file;
      setFormData({ ...formData, videos: newVideos });
      
      const newPreviews = [...videoPreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setVideoPreviews(newPreviews);
      
      const newFileNames = [...videoFileNames];
      newFileNames[index] = file.name;
      setVideoFileNames(newFileNames);
    }
  };

  const handleRemoveFile = (e, index, type) => {
    e.stopPropagation();
    if (type === 'photo') {
      const newPreviews = [...photoPreviews];
      newPreviews[index] = null;
      setPhotoPreviews(newPreviews);
      
      const newPhotos = [...formData.photos];
      newPhotos[index] = null;
      setFormData({ ...formData, photos: newPhotos });
    } else {
      const newPreviews = [...videoPreviews];
      newPreviews[index] = null;
      setVideoPreviews(newPreviews);
      
      const newVideos = [...formData.videos];
      newVideos[index] = null;
      setFormData({ ...formData, videos: newVideos });
      
      const newFileNames = [...videoFileNames];
      newFileNames[index] = null;
      setVideoFileNames(newFileNames);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-1">Photos</label>
        <div className="grid grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <div key={index} className="relative">
              <input
                type="file"
                ref={el => photoInputRefs.current[index] = el}
                onChange={(e) => handleFileChange(e, index, 'photo')}
                accept="image/*"
                className="hidden"
              />
              <div
                onClick={() => photoInputRefs.current[index]?.click()}
                className={`w-full aspect-square cursor-pointer rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-2 overflow-hidden ${
                  photoPreviews[index]
                    ? "border-[#5B4FE9] bg-purple-50"
                    : "border-gray-300 hover:border-gray-400 bg-gray-50"
                }`}
              >
                {photoPreviews[index] ? (
                  <>
                    <Image
                      src={photoPreviews[index]}
                      alt={`Preview ${index + 1}`}
                      width={500}
                      height={500}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={(e) => handleRemoveFile(e, index, 'photo')}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full cursor-pointer flex items-center justify-center shadow-md transition-colors z-10"
                    >
                      <X className="w-3 h-3" />
                    </button> 
                  </>
                ) : (
                  <>
                    <Camera className="w-8 h-8 text-gray-600" />
                    <span className="text-xs text-gray-500">Add Photo</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Add at least 3 photos of your item (videos optional)
        </p>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-900 mb-1">Videos (Optional)</label>
        <p className="text-xs text-gray-500 mb-3 flex items-center gap-1">
          <Video className="w-3 h-3" />
          Add a short video to showcase your item in action (max 60 seconds)
        </p>
        <div className="grid grid-cols-2 gap-4">
          {[0, 1].map((index) => (
            <div key={index} className="relative">
              <input
                type="file"
                ref={el => videoInputRefs.current[index] = el}
                onChange={(e) => handleFileChange(e, index, 'video')}
                accept="video/*"
                className="hidden"
              />
              <div
                onClick={() => videoInputRefs.current[index]?.click()}
                className={`w-full aspect-[2/1] rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-1 overflow-hidden ${
                  videoPreviews[index]
                    ? "border-[#5B4FE9] bg-purple-50"
                    : "border-gray-300 hover:border-gray-400 bg-gray-50"
                }`}
              >
                {videoPreviews[index] ? (
                  <>
                    <video
                      src={videoPreviews[index]}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 left-2 right-2 bg-black/50 text-white text-xs p-1 rounded truncate">
                      {videoFileNames[index]}
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveFile(e, index, 'video')}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors z-10"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </>
                ) : (
                  <>
                    <Video className="w-8 h-8 text-gray-600" />
                    <span className="text-xs text-gray-500">Add Video</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}