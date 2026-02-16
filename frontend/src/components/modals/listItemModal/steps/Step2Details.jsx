"use client";

import { MapPin } from "lucide-react";
// import { categories } from "@/data/listingsData";
import RichTextEditor from "@/components/tiptap-editor/RichTextEditor";
import { useState, useEffect } from "react";
import { getAllCategory } from "@/services/category.service";

export default function Step2Details({ formData, setFormData }) {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleRichTextChange = (field, content) => {
    setFormData({ ...formData, [field]: content });
  };

  const handleArrayFieldChange = (field, value) => {
    // Keep raw lines while typing so Enter/new lines work normally.
    // Cleanup is handled later during submit.
    setFormData({ ...formData, [field]: value.split("\n") });
  };  
    // ✅ Fetch categories from backend
    useEffect(() => {
      const fetchCategories = async () => {
        try {
          setLoadingCategories(true);
          const res = await getAllCategory("item");
  
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
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Item Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="itemName"
          value={formData.itemName}
          onChange={handleInputChange}
          placeholder="e.g., Professional Pressure Washer"
          className="w-full px-4 py-3 text-gray-700 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]/20 focus:border-[#5B4FE9] transition-all placeholder:text-gray-400"
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Category <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <select
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-4 py-3 text-gray-700 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]/20 focus:border-[#5B4FE9] transition-all appearance-none bg-white cursor-pointer"
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>
 
      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Description <span className="text-red-500">*</span>
        </label>
        <RichTextEditor
          value={formData.description}
          onChange={(content) => handleRichTextChange("description", content)}
        />
      </div>

       <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Features & Details 
        </label>
        <textarea
          value={Array.isArray(formData.features) ? formData.features.join("\n") : ""}
          onChange={(e) => handleArrayFieldChange("features", e.target.value)}
          placeholder="Enter one feature per line"
          rows={4}
          className="w-full px-4 py-3 text-gray-700 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]/20 focus:border-[#5B4FE9] transition-all placeholder:text-gray-400"
        />
        <p className="text-xs text-gray-500 mt-1">Example: Powerful motor</p>
      </div>

       <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Rental Rules 
        </label>
        <textarea
          value={
            Array.isArray(formData.rentalRules)
              ? formData.rentalRules.join("\n")
              : ""
          }
          onChange={(e) =>
            handleArrayFieldChange("rentalRules", e.target.value)
          }
          placeholder="Enter one rule per line"
          rows={4}
          className="w-full px-4 py-3 text-gray-700 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]/20 focus:border-[#5B4FE9] transition-all placeholder:text-gray-400"
        />
        <p className="text-xs text-gray-500 mt-1">
          Example: Return item clean and on time
        </p>
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
           Cancellation Policy
        </label>
        <RichTextEditor
          value={formData.cancellationPolicy}
          onChange={(content) =>
            handleRichTextChange("cancellationPolicy", content)
          }
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-gray-900 mb-2">
          Pickup Location <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="pickupLocation"
            value={formData.pickupLocation}
            onChange={handleInputChange}
            placeholder="Street address, City, State ZIP"
            className="w-full pl-12 pr-4 py-3 text-gray-700 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#5B4FE9]/20 focus:border-[#5B4FE9] transition-all placeholder:text-gray-400"
          />
        </div>
      </div>
    </div>
  );
}
