"use client";

import { useEffect, useState } from "react";
import { useListBusiness } from "@/context/ListBusinessContext";
import RichTextEditor from "@/app/components/tiptap-editor/RichTextEditor";
import { getAllCategory } from "@/services/category.service";

export default function BusinessInfoStep() {
  const { formData, updateFormData, errors, setErrors } = useListBusiness();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState(null);

  const setField = (key, value) => {
    updateFormData({ [key]: value });
    if (errors?.[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await getAllCategory("service");
        setCategories(res.data?.data || res.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategoryError("Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div>
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700">
              Business name *
            </label>
            <input
              type="text"
              value={formData.businessName}
              onChange={(e) => setField("businessName", e.target.value)}
              placeholder="e.g. Home Appliance Experts"
              className={`mt-2 w-full rounded-xl border px-4 py-2.5 text-sm text-gray-700 focus:outline-none ${
                errors?.businessName
                  ? "border-rose-400 ring-2 ring-rose-100"
                  : "border-gray-300 focus:border-purple-500"
              }`}
            />
            {errors?.businessName && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.businessName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Type of service *
            </label>
            <input
              type="text"
              value={formData.serviceType}
              onChange={(e) => setField("serviceType", e.target.value)}
              placeholder="e.g. Appliance Repair"
              className={`mt-2 w-full rounded-xl border px-4 py-2.5 text-sm text-gray-700 focus:outline-none ${
                errors?.serviceType
                  ? "border-rose-400 ring-2 ring-rose-100"
                  : "border-gray-300 focus:border-purple-500"
              }`}
            />
            {errors?.serviceType && (
              <p className="mt-1 text-xs text-rose-600">{errors.serviceType}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">
              Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setField("category", e.target.value)}
              disabled={loadingCategories}
              className={`mt-2 w-full rounded-xl border px-4 py-2.5 text-sm text-gray-700 focus:outline-none disabled:bg-gray-100 ${
                errors?.category
                  ? "border-rose-400 ring-2 ring-rose-100"
                  : "border-gray-300 focus:border-purple-500"
              }`}
            >
              <option value="">
                {loadingCategories
                  ? "Loading categories..."
                  : "Select category"}
              </option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors?.category && (
              <p className="mt-1 text-xs text-rose-600">{errors.category}</p>
            )}
            {categoryError && (
              <p className="mt-1 text-xs text-rose-600">{categoryError}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700">
              Years in business *
            </label>
            <input
              type="number"
              min={0}
              value={formData.yearsInBusiness}
              onChange={(e) => setField("yearsInBusiness", e.target.value)}
              placeholder="e.g. 5"
              className={`mt-2 w-full rounded-xl border px-4 py-2.5 text-sm text-gray-700 focus:outline-none ${
                errors?.yearsInBusiness
                  ? "border-rose-400 ring-2 ring-rose-100"
                  : "border-gray-300 focus:border-purple-500"
              }`}
            />
            {errors?.yearsInBusiness && (
              <p className="mt-1 text-xs text-rose-600">
                {errors.yearsInBusiness}
              </p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700">
              Description *
            </label>
            <div
              className={`mt-2 rounded-xl ${errors?.description ? "ring-2 ring-rose-100" : ""}`}
            >
              <RichTextEditor
                value={formData.description}
                onChange={(content) => setField("description", content)}
              />
            </div>
            {errors?.description ? (
              <p className="mt-1 text-xs text-rose-600">{errors.description}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-500">
                Minimum 20 characters recommended.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
