"use client";

import { useEffect, useState } from "react";
import { useListBusiness } from "@/context/ListBusinessContext";
import RichTextEditor from "@/components/tiptap-editor/RichTextEditor";
import { getAllCategory } from "@/services/category.service"; // ✅ adjust path if needed

export default function BusinessInfoStep() {
  const { formData, setFormData, updateFormData } = useListBusiness();

  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState(null);

  const handleDescriptionChange = (content) => {
    setFormData({ ...formData, description: content });
  };

  // ✅ Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await getAllCategory("service");

        // Adjust depending on your backend response structure
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
    <div className="max-h-[450px] overflow-y-auto">
      <div className="space-y-6 pr-2">
        {/* TITLE */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mt-2">
            Tell us about your business
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            This information helps customers understand your service.
          </p>
        </div>

        {/* BUSINESS NAME */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Business name *
          </label>
          <input
            type="text"
            name="businessName"
            value={formData.businessName}
            onChange={(e) =>
              updateFormData({ businessName: e.target.value })
            }
            placeholder="Eg. Home Appliance Experts"
            className="mt-2 w-full text-gray-700 rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none"
          />
        </div>

        {/* SERVICE TYPE */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Type of service *
          </label>
          <input
            type="text"
            name="serviceType"
            value={formData.serviceType}
            onChange={(e) =>
              updateFormData({ serviceType: e.target.value })
            }
            placeholder="Eg. Appliance Repair"
            className="mt-2 w-full text-gray-700 rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none"
          />
        </div>

        {/* CATEGORY */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Category *
          </label>

          <select
            value={formData.category}
            name="category"
            onChange={(e) =>
              updateFormData({ category: e.target.value })
            }
            disabled={loadingCategories}
            className="mt-2 w-full text-gray-700 rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none disabled:bg-gray-100"
          >
            <option value="">
              {loadingCategories ? "Loading categories..." : "Select category"}
            </option>

            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>

          {categoryError && (
            <p className="text-sm text-red-500 mt-1">
              {categoryError}
            </p>
          )}
        </div>

        {/* YEARS IN BUSINESS */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Years in business *
          </label>
          <input
            type="number"
            min={0}
            name="yearsInBusiness"
            value={formData.yearsInBusiness}
            onChange={(e) =>
              updateFormData({ yearsInBusiness: e.target.value })
            }
            placeholder="Eg. 5"
            className="mt-2 w-full text-gray-700 rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none"
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Description *
          </label>
          <RichTextEditor
            value={formData.description}
            name="description"
            onChange={handleDescriptionChange}
          />
        </div>
      </div>
    </div>
  );
}