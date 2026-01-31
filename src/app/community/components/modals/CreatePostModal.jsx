// app/community/modals/CreatePostModal.jsx
"use client";
import Image from "next/image";

import { useState, useRef } from "react";
import { X, Wrench, Package, Camera, Calendar } from "lucide-react";

export default function CreatePostModal({ isOpen, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    type: "service",
    title: "",
    description: "",
    category: "",
    city: "",
    state: "",
    dateNeeded: "",
    budget: "",
    photos: [],
  });

  const [photoPreviews, setPhotoPreviews] = useState([null, null, null]);
  const fileInputRefs = [useRef(null), useRef(null), useRef(null)];

  if (!isOpen) return null;

  const handleTypeSelect = (type) => {
    setFormData({ ...formData, type });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePhotoClick = (index) => {
    fileInputRefs[index].current?.click();
  };

  const handleFileChange = (e, index) => {
    const file = e.target.files?.[0];
    if (file) {
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
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.(formData);
    onClose();
    // Reset form
    setFormData({
      type: "service",
      title: "",
      description: "",
      category: "",
      city: "",
      state: "",
      dateNeeded: "",
      budget: "",
      photos: [],
    });
    setPhotoPreviews([null, null, null]);
  };

  const handleRemovePhoto = (index) => {
    const newPreviews = [...photoPreviews];
    newPreviews[index] = null;
    setPhotoPreviews(newPreviews);

    const newPhotos = [...formData.photos];
    newPhotos[index] = null;
    setFormData({ ...formData, photos: newPhotos });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white px-8 pt-8 pb-4 border-b border-gray-100 z-10">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-[#5B4FE9] to-[#E95FC8] bg-clip-text text-transparent">
                Create Post
              </h2>
              <p className="text-gray-500 mt-1">
                Request a service or item from your community
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 cursor-pointer rounded-full transition-colors duration-200 group"
            >
              <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              What are you looking for? <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-4">
              {/* Service Request Option */}
              <button
                type="button"
                onClick={() => handleTypeSelect("service")}
                className={`flex flex-col cursor-pointer items-center justify-center p-6 rounded-xl border-2 transition-all duration-200 ${
                  formData.type === "service"
                    ? "border-[#5B4FE9] bg-purple-50/50 shadow-md"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div
                  className={`p-3 rounded-full mb-3 ${
                    formData.type === "service"
                      ? "bg-purple-100"
                      : "bg-gray-100"
                  }`}
                >
                  <Wrench
                    className={`w-8 h-8 ${
                      formData.type === "service"
                        ? "text-[#5B4FE9]"
                        : "text-gray-600"
                    }`}
                  />
                </div>
                <span
                  className={`font-bold mb-1 ${
                    formData.type === "service"
                      ? "text-gray-900"
                      : "text-gray-700"
                  }`}
                >
                  Service Request
                </span>
                <span className="text-xs text-gray-500 text-center">
                  Photographer, makeup artist, etc.
                </span>
              </button>

              {/* Item Request Option */}
              <button              
                onClick={() => handleTypeSelect("item")}
                className={`flex flex-col cursor-pointer items-center justify-center p-6 rounded-xl border-2 transition-all duration-200 ${
                  formData.type === "item"
                    ? "border-[#5B4FE9] bg-purple-50/50 shadow-md"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div
                  className={`p-3 rounded-full mb-3 ${
                    formData.type === "item" ? "bg-purple-100" : "bg-gray-100"
                  }`}
                >
                  <Package
                    className={`w-8 h-8 ${
                      formData.type === "item"
                        ? "text-[#5B4FE9]"
                        : "text-gray-600"
                    }`}
                  />
                </div>
                <span
                  className={`font-bold mb-1 ${
                    formData.type === "item" ? "text-gray-900" : "text-gray-700"
                  }`}
                >
                  Item Request
                </span>
                <span className="text-xs text-gray-500 text-center">
                  Power washer, camera, etc.
                </span>
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              //   placeholder="e.g., Need photographer for wedding"
              placeholder={`${formData.type === "item" ? "e.g., Looking for power washer" : "e.g., Need photographer for wedding"}`}
              required
              className="w-full px-4 py-3 text-gray-700 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5B4FE9] transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Provide details about what you need..."
              required
              rows={4}
              className="w-full text-gray-700 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5B4FE9] transition-all placeholder:text-gray-400 resize-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              placeholder="e.g. Photography, Beauty, Moving"
              required
              className="w-full text-gray-700 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5B4FE9] transition-all placeholder:text-gray-400"
            />
          </div>

          {/* City & State */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                placeholder="Orlando"
                required
                className="w-full text-gray-700 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5B4FE9] transition-all placeholder:text-gray-400"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="FL"
                required
                className="w-full text-gray-700 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5B4FE9] transition-all placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Date Needed */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Date Needed <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                name="dateNeeded"
                value={formData.dateNeeded}
                onChange={handleInputChange}
                required
                placeholder="dd-mm-yyyy"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5B4FE9] transition-all placeholder:text-gray-400 text-gray-700"
              />
              <Calendar className="absolute  right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Budget (Optional)
            </label>
            <input
              type="text"
              name="budget"
              value={formData.budget}
              onChange={handleInputChange}
              placeholder="e.g. $500-800 or $50/day"
              className="w-full text-gray-700 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-[#5B4FE9] transition-all placeholder:text-gray-400"
            />
          </div>

          {/* Photos */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Photos (Optional)
            </label>
            <p className="text-sm text-gray-500 mb-3">
              Add photos to show examples of what you&apos;re looking for
            </p>
            <div className="grid grid-cols-3 gap-4">
              {[0, 1, 2].map((index) => (
                <div key={index} className="relative">
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
                    className={`w-full aspect-square rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center gap-2 overflow-hidden ${
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
                        {/* Remove Button */}
                        <button
                    
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent opening file dialog
                            handleRemovePhoto(index);
                          }}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white cursor-pointer rounded-full flex items-center justify-center shadow-md transition-colors z-10"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <>
                        <Camera className="w-8 h-8 text-gray-400" />
                        <span className="text-xs text-gray-500">Add Photo</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full py-4 cursor-pointer rounded-xl font-bold text-white bg-gradient-to-r from-[#5B4FE9] to-[#E95FC8] hover:shadow-lg hover:shadow-purple-500/25 transition-all duration-200 transform hover:-translate-y-0.5"
            >
              Post to Community
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
