"use client";

import { useListBusiness } from "@/context/ListBusinessContext";

const STEPS = [
  { id: 1, label: "Business Info" },
  { id: 2, label: "Contact & Location" },
  { id: 3, label: "Showcase" },
  { id: 4, label: "Plan" },
];

export default function StepIndicator() {
  const { currentStep } = useListBusiness();

  return (
    <div className="flex items-center justify-between">
      {STEPS.map((step, index) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;

        return (
          <div key={step.id} className="flex flex-1 items-center">
            {/* CIRCLE */}
            <div className="flex flex-col items-center">
              <div
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition
                  ${
                    isCompleted
                      ? "  bg-linear-to-r from-[#5B4FE9] to-[#E95FC8] text-white"
                      : isActive
                      ? "border-2 border-purple-500 text-black"
                      : "border border-gray-300 text-gray-400"
                  }`}
              >
                {step.id}
              </div>

              {/* LABEL */}
              <span
                className={`mt-2 text-xs font-medium
                  ${
                    isActive || isCompleted
                      ? "text-gray-900"
                      : "text-gray-400"
                  }`}
              >
                {step.label}
              </span>
            </div>

            {/* CONNECTOR */}
            {index !== STEPS.length - 1 && (
              <div
                className={`mx-2 h-[2px] flex-1 transition 
                  ${
                    isCompleted
                      ? "bg-linear-to-r from-[#5B4FE9] to-[#E95FC8]"
                      : "bg-gray-200"
                  }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
