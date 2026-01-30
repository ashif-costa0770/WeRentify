"use client";

import { useListBusiness } from "@/context/ListBusinessContext";
import { categories } from "@/data/servicesData";

export default function BusinessInfoStep() {
  const { formData, updateFormData } = useListBusiness();

  return (
    <div className="space-y-1">
      {/* TITLE */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900">
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
          onChange={(e) =>
            updateFormData({ category: e.target.value })
          }
          className="mt-2 w-full     text-gray-700 rounded-xl border border-gray-300 px-4 py-2 text-sm focus:border-purple-500 focus:outline-none"
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
        <textarea
          rows={3}
          value={formData.description}
          onChange={(e) =>
            updateFormData({ description: e.target.value })
          }
          placeholder="Describe your services, experience, and what makes you stand out..."
          className="mt-2  text-gray-700 w-full resize-none rounded-xl border border-gray-300 px-3 py-1 text-sm focus:border-purple-500 focus:outline-none"
        />
      </div>
    </div>
  );
}
