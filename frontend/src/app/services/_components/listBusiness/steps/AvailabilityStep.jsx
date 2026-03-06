"use client";

import { useListBusiness } from "@/context/ListBusinessContext";

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export default function AvailabilityStep() {
  const { formData, updateFormData, errors, setErrors } = useListBusiness();

  const setField = (key, value) => {
    updateFormData({ [key]: value });
    if (errors?.[key]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  };

  const toggleWorkingDay = (day) => {
    const current = Array.isArray(formData.workingDays) ? formData.workingDays : [];
    const exists = current.includes(day);
    const next = exists ? current.filter((item) => item !== day) : [...current, day];
    setField("workingDays", next);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900">Service Availability</h3>
        <p className="mt-1 text-sm text-gray-500">
          Define how you deliver service and when customers can book you.
        </p>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">Service Delivery Mode *</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label
            className={`cursor-pointer rounded-xl border px-4 py-3 text-sm transition ${
              formData.serviceMode === "onsite"
                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                : "border-gray-300 bg-white text-gray-700 hover:border-indigo-300"
            }`}
          >
            <input
              type="radio"
              className="mr-2 accent-indigo-600"
              name="serviceMode"
              value="onsite"
              checked={formData.serviceMode === "onsite"}
              onChange={() => setField("serviceMode", "onsite")}
            />
            I go to customer location
          </label>

          <label
            className={`cursor-pointer rounded-xl border px-4 py-3 text-sm transition ${
              formData.serviceMode === "shop"
                ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                : "border-gray-300 bg-white text-gray-700 hover:border-indigo-300"
            }`}
          >
            <input
              type="radio"
              className="mr-2 accent-indigo-600"
              name="serviceMode"
              value="shop"
              checked={formData.serviceMode === "shop"}
              onChange={() => setField("serviceMode", "shop")}
            />
            Customer visits my shop
          </label>
        </div>
        {errors?.serviceMode && <p className="text-xs text-rose-600">{errors.serviceMode}</p>}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">Working Days *</p>
        <div className="flex flex-wrap gap-2">
          {WEEK_DAYS.map((day) => {
            const isSelected = Array.isArray(formData.workingDays) && formData.workingDays.includes(day);
            return (
              <button
                key={day}
                type="button"
                onClick={() => toggleWorkingDay(day)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  isSelected
                    ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                    : "border-gray-300 bg-white text-gray-700 hover:border-indigo-300"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
        {errors?.workingDays && <p className="text-xs text-rose-600">{errors.workingDays}</p>}
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">Working Hours *</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-medium text-gray-600">Start Time</label>
            <input
              type="time"
              value={formData.startTime}
              onChange={(e) => setField("startTime", e.target.value)}
              className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm text-gray-700 focus:outline-none ${
                errors?.startTime
                  ? "border-rose-400 ring-2 ring-rose-100"
                  : "border-gray-300 focus:border-indigo-500"
              }`}
            />
            {errors?.startTime && <p className="mt-1 text-xs text-rose-600">{errors.startTime}</p>}
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600">End Time</label>
            <input
              type="time"
              value={formData.endTime}
              onChange={(e) => setField("endTime", e.target.value)}
              className={`mt-1 w-full rounded-xl border px-3 py-2 text-sm text-gray-700 focus:outline-none ${
                errors?.endTime
                  ? "border-rose-400 ring-2 ring-rose-100"
                  : "border-gray-300 focus:border-indigo-500"
              }`}
            />
            {errors?.endTime && <p className="mt-1 text-xs text-rose-600">{errors.endTime}</p>}
          </div>
        </div>

        <p className="text-xs text-gray-500">
          Slots are auto-generated in fixed 1-hour duration.
        </p>
      </div>
    </div>
  );
}
