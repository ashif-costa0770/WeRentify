"use client";

import { X } from "lucide-react";
import { useListBusiness } from "@/context/ListBusinessContext";

import StepIndicator from "../listBusiness/StepIndicator";
import BusinessInfoStep from "../listBusiness/steps/BusinessInfoStep";
import ContactLocationStep from "../listBusiness/steps/ContactLocationStep";
import ShowcaseStep from "../listBusiness/steps/ShowcaseStep";
import PlanSelectionStep from "../listBusiness/steps/PlanSelectionStep";

export default function ListBusinessModal() {
  const {
    isOpen,
    closeModal,
    currentStep,
    nextStep,
    prevStep,
    resetStep,
    formData,
    setFormData,
    submitBusiness,
  } = useListBusiness();

  // ---------------- VALIDATION ----------------
  const validateStep = () => {
    const {
      businessName,
      serviceType,
      category,
      yearsInBusiness,
      description,
      location,
      serviceRadius,
      phone,
      email,
      photos,
      hourlyRate,
      plan,
    } = formData;

    // STEP 1
    if (currentStep === 1) {
      if (
        !businessName ||
        !serviceType ||
        !category ||
        !yearsInBusiness ||
        !description
      ) {
        alert("Please fill all required fields");
        return false;
      }
    }

    // STEP 2
    if (currentStep === 2) {
      if (!location || !serviceRadius || !phone || !email) {
        alert("Please fill all required fields");
        return false;
      }
    }

    // STEP 3
    if (currentStep === 3) {
      if (!photos || photos.length < 3 || !hourlyRate) {
        alert("Please add at least 3 photos and set your hourly rate");
        return false;
      }
    }

    // STEP 4
    if (currentStep === 4) {
      if (!plan) {
        alert("Please choose a plan");
        return false;
      }
    }

    return true;
  };

  if (!isOpen) return null;

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <BusinessInfoStep />;
      case 2:
        return <ContactLocationStep />;
      case 3:
        return <ShowcaseStep />;
      case 4:
        return <PlanSelectionStep />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* BACKDROP (click disabled) */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* MODAL */}
      <div className="relative z-10 w-full max-w-3xl mx-4 rounded-3xl bg-white shadow-xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b px-6 py-2">
          <h2 className="text-lg font-semibold text-gray-900">
            List Your Business
          </h2>

          {/* FORCE CLOSE */}
          <button
            onClick={closeModal}
            className="rounded-full cursor-pointer p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {/* STEP INDICATOR */}
        <div className="px-6 pt-2 ml-24">
          <StepIndicator />
        </div>

        {/* CONTENT */}
        <div className="px-6 py-2 mx-auto min-h-[360px]">{renderStep()}</div>

        {/* FOOTER */}
        <div className="flex items-center justify-between border-t px-6 py-2">
          <button
            onClick={prevStep}
            disabled={currentStep === 1}
            className={`rounded-xl cursor-pointer px-6 py-2 text-sm font-medium transition
              ${
                currentStep === 1
                  ? "cursor-not-allowed text-gray-500"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            Back
          </button>

          <button
            onClick={() => {
              if (!validateStep()) return;
              if (currentStep === 4) {
                submitBusiness(); // ✅ alert + payload
                closeModal();
                setFormData({}); // optional (recommended)
                resetStep(); // optional (recommended)
              } else {
                nextStep();
              }
            }}
            className="rounded-xl cursor-pointer bg-gradient-to-r from-[#5B4FE9] to-[#E95FC8] px-8 py-2 text-sm font-semibold text-white hover:opacity-90"
          >
            {currentStep === 4 ? "Start Subscription" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
