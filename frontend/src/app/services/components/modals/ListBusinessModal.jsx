"use client";

import { X, Loader2 } from "lucide-react";
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
    formData,
    isSubmitting, // ✅ NEW
    submitBusiness,
  } = useListBusiness();

  const validateStep = () => {
    const {
      businessName, serviceType, category, yearsInBusiness, description,
      location, serviceRadius, phone, email, photos, hourlyRate, plan,
    } = formData;

    if (currentStep === 1) {
      if (!businessName || !serviceType || !category || !yearsInBusiness || !description) {
        alert("Please fill all required fields");
        return false;
      }
    }
    if (currentStep === 2) {
      if (!location || !serviceRadius || !phone || !email) {
        alert("Please fill all required fields");
        return false;
      }
    }
    if (currentStep === 3) {
      if (!photos || photos.length < 3 || !hourlyRate) {
        alert("Please add at least 3 photos and set your hourly rate");
        return false;
      }
    }
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
      case 1: return <BusinessInfoStep />;
      case 2: return <ContactLocationStep />;
      case 3: return <ShowcaseStep />;
      case 4: return <PlanSelectionStep />;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative z-10 w-full max-w-3xl mx-4 rounded-3xl bg-white shadow-xl">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-2">
          <h2 className="text-xl font-bold text-transparent bg-clip-text bg-linear-to-r from-[#5B4FE9] to-[#E95FC8]">
            List Your Business
          </h2>
          <button
            onClick={closeModal}
            disabled={isSubmitting} // ✅ block close while submitting
            className="rounded-full cursor-pointer p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <X size={22} />
          </button>
        </div>

        {/* STEP INDICATOR */}
        <div className="px-6 pt-2 ml-24">
          <StepIndicator />
        </div>

        {/* CONTENT */}
        <div className="px-6 py-2 mx-auto min-h-[360px]">{renderStep()}</div>

        {/* FOOTER */}
        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-2">
          <button
            onClick={prevStep}
            disabled={currentStep === 1 || isSubmitting} // ✅
            className={`rounded-xl cursor-pointer px-6 py-2 text-sm font-medium transition
              ${currentStep === 1 || isSubmitting
                ? "cursor-not-allowed text-gray-400"
                : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            Back
          </button>

          <button
            disabled={isSubmitting} // ✅ block while loading
            onClick={() => {
              if (!validateStep()) return;
              if (currentStep === 4) {
                submitBusiness(); // context handles close + redirect + reset
              } else {
                nextStep();
              }
            }}
            className="flex items-center gap-2 rounded-xl cursor-pointer bg-linear-to-r from-[#5B4FE9] to-[#E95FC8] px-8 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Submitting...
              </>
            ) : currentStep === 4 ? (
              "Start Subscription"
            ) : (
              "Continue"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}