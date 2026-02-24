"use client";

import { useListBusiness } from "@/context/ListBusinessContext";

export default function ContactLocationStep() {
  const { formData, updateFormData, errors, setErrors } = useListBusiness();

  const setField = (key, value) => {
    updateFormData({ [key]: value });
    if (errors?.[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  return (
    <div>
      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700">Service location *</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setField("location", e.target.value)}
              className={`mt-2 w-full rounded-xl border px-4 py-2.5 text-sm text-gray-700 focus:outline-none ${
                errors?.location
                  ? "border-rose-400 ring-2 ring-rose-100"
                  : "border-gray-300 focus:border-purple-500"
              }`}
              placeholder="City, State or Zip"
            />
            {errors?.location && <p className="mt-1 text-xs text-rose-600">{errors.location}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Service area (miles) *</label>
            <input
              type="number"
              value={formData.serviceRadius}
              onChange={(e) => setField("serviceRadius", e.target.value)}
              className={`mt-2 w-full rounded-xl border px-4 py-2.5 text-sm text-gray-700 focus:outline-none ${
                errors?.serviceRadius
                  ? "border-rose-400 ring-2 ring-rose-100"
                  : "border-gray-300 focus:border-purple-500"
              }`}
              placeholder="e.g. 15"
            />
            {errors?.serviceRadius && (
              <p className="mt-1 text-xs text-rose-600">{errors.serviceRadius}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Phone number *</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setField("phone", e.target.value)}
              className={`mt-2 w-full rounded-xl border px-4 py-2.5 text-sm text-gray-700 focus:outline-none ${
                errors?.phone
                  ? "border-rose-400 ring-2 ring-rose-100"
                  : "border-gray-300 focus:border-purple-500"
              }`}
              placeholder="+1 234 567 890"
            />
            {errors?.phone && <p className="mt-1 text-xs text-rose-600">{errors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setField("email", e.target.value)}
              className={`mt-2 w-full rounded-xl border px-4 py-2.5 text-sm text-gray-700 focus:outline-none ${
                errors?.email
                  ? "border-rose-400 ring-2 ring-rose-100"
                  : "border-gray-300 focus:border-purple-500"
              }`}
              placeholder="business@email.com"
            />
            {errors?.email && <p className="mt-1 text-xs text-rose-600">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700">Website (optional)</label>
            <input
              type="url"
              value={formData.website}
              onChange={(e) => setField("website", e.target.value)}
              className={`mt-2 w-full rounded-xl border px-4 py-2.5 text-sm text-gray-700 focus:outline-none ${
                errors?.website
                  ? "border-rose-400 ring-2 ring-rose-100"
                  : "border-gray-300 focus:border-purple-500"
              }`}
              placeholder="https://business.com"
            />
            {errors?.website && <p className="mt-1 text-xs text-rose-600">{errors.website}</p>}
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700">Certifications/Licenses (optional)</label>
            <textarea
              rows={3}
              value={formData.certifications}
              onChange={(e) => setField("certifications", e.target.value)}
              className="mt-2 w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm text-gray-700 focus:border-purple-500 focus:outline-none"
              placeholder="List any relevant certifications or licenses"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
