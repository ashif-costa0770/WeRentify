"use client";

import { useListBusiness } from "@/context/ListBusinessContext";
import { categories } from "@/data/servicesData";
import RichTextEditor from "@/components/tiptap-editor/RichTextEditor";

export default function BusinessInfoStep() {
  const { formData, setFormData, updateFormData } = useListBusiness();

  const handleDescriptionChange = (content) => {
    setFormData({ ...formData, description: content });
  };

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
            value={formData.businessName}
            onChange={(e) => updateFormData({ businessName: e.target.value })}
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
            value={formData.serviceType}
            onChange={(e) => updateFormData({ serviceType: e.target.value })}
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
            onChange={(e) => updateFormData({ category: e.target.value })}
            className="mt-2 w-full text-gray-700 rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none"
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* YEARS IN BUSINESS */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Years in business *
          </label>
          <input
            type="number"
            min={0}
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
            onChange={handleDescriptionChange}
          />
        </div>
      </div>
    </div>
  );
}