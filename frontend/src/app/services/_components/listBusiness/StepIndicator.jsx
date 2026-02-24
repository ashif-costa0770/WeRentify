"use client";

import { useListBusiness } from "@/context/ListBusinessContext";

const STEPS = [
  { id: 1, label: "Business" },
  { id: 2, label: "Contact" },
  { id: 3, label: "Showcase" },
  { id: 4, label: "Plan" },
];

export default function StepIndicator() {
  const { currentStep } = useListBusiness();

  return (
    <div className="grid grid-cols-4 gap-2">
      {STEPS.map((step, index) => {
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;

        return (
          <div key={step.id} className="flex flex-col items-center">
            <div className="relative flex w-full items-center justify-center">
              {index !== 0 && (
                <div
                  className={`absolute left-0 right-1/2 top-1/2 h-[2px] -translate-y-1/2 ${
                    currentStep > step.id - 1
                      ? "bg-linear-to-r from-[#5B4FE9] to-[#E95FC8]"
                      : "bg-gray-200"
                  }`}
                />
              )}
              {index !== STEPS.length - 1 && (
                <div
                  className={`absolute left-1/2 right-0 top-1/2 h-[2px] -translate-y-1/2 ${
                    isCompleted
                      ? "bg-linear-to-r from-[#5B4FE9] to-[#E95FC8]"
                      : "bg-gray-200"
                  }`}
                />
              )}

              <div
                className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all ${
                  isCompleted || isActive
                    ? "bg-linear-to-r from-[#5B4FE9] to-[#E95FC8] text-white shadow-md"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step.id}
              </div>
            </div>
            <p
              className={`mt-2 text-[11px] font-semibold sm:text-xs ${
                isCompleted || isActive ? "text-gray-900" : "text-gray-400"
              }`}
            >
              {step.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
