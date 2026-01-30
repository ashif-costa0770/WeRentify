"use client";

import { useListBusiness } from "@/context/ListBusinessContext";

export default function ContactLocationStep() {
  const { formData, updateFormData } = useListBusiness();

  return (
    <div className="space-y-2 mt-2">
      <h3 className="text-xl font-bold text-gray-900">
        Contact & Location
      </h3>

      {/* CONTACT NAME */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
        Service Location  *
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => updateFormData({ location: e.target.value })}
          className="w-full text-gray-700   text-sm rounded-xl border border-gray-300  focus:border-purple-500 focus:outline-none px-4 py-1"
          placeholder="City, State or Zip"
        />
      </div>

      {/* Service Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Service Area (miles) *
        </label>
        <input
          type="number"
          value={formData.serviceRadius}
          onChange={(e) => updateFormData({ serviceRadius: e.target.value })}
          className="w-full text-gray-700 text-sm  rounded-xl border border-gray-300 focus:border-purple-500 focus:outline-none px-4 py-1"
          placeholder="How far do you travel to provide service? (eg. 15)"
        />
      </div>

      {/* PHONE */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number *
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => updateFormData({ phone: e.target.value })}
          className="w-full text-gray-700  text-sm rounded-xl border border-gray-300 focus:border-purple-500 focus:outline-none px-4 py-1"
          placeholder="+1 234 567 890"
        />
      </div>

      {/* LOCATION */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Email *
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => updateFormData({ email: e.target.value })}
          className="w-full text-gray-700 text-sm  rounded-xl border border-gray-300 focus:border-purple-500 focus:outline-none px-4 py-1"
          placeholder="business@email.com"
        />
      </div>

      {/* LOCATION */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
         Website (Optional)
        </label>
        <input
          type="url"
          value={formData.website}
          onChange={(e) => updateFormData({ website: e.target.value })}
          className="w-full text-gray-700 text-sm  rounded-xl border border-gray-300 focus:border-purple-500 focus:outline-none px-4 py-1"
          placeholder="https://business.com"
        />
      </div>

      {/* Certifications */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
         Certifications/Licenses (Optional)
        </label>
        <textarea
          rows={3}
          value={formData.certifications}
          onChange={(e) => updateFormData({ certifications: e.target.value })}
          className="w-full text-gray-700 text-sm rounded-xl border border-gray-300 px-4 py-1 focus:border-purple-500 focus:outline-none resize-none"
          placeholder="Tell customers about your service..."
        />
      </div>
    </div>
  );
}
