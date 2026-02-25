"use client";

import { X, Loader2 } from "lucide-react";
import { useListBusiness } from "@/context/ListBusinessContext";

import StepIndicator from "../listBusiness/StepIndicator";
import BusinessInfoStep from "../listBusiness/steps/BusinessInfoStep";
import ContactLocationStep from "../listBusiness/steps/ContactLocationStep";
import ShowcaseStep from "../listBusiness/steps/ShowcaseStep";
import PlanSelectionStep from "../listBusiness/steps/PlanSelectionStep";
import { toast } from "sonner";

const STEP_META = {
  1: {
    title: "Tell us about your business",
    subtitle:
      "Fill core business details so customers can trust your listing quickly.",
  },
  2: {
    title: "Contact & Location",
    subtitle: "Help customers know where and how to reach you.",
  },
  3: {
    title: "Showcase Your Work",
    subtitle: "Add media and your hourly price.",
  },
  4: {
    title: "Choose a Plan",
    subtitle: "Select a plan that fits your growth stage.",
  },
};

export default function ListBusinessModal() {
  const {
    isOpen,
    modalMode,
    existingMediaCounts,
    closeModal,
    currentStep,
    nextStep,
    prevStep,
    formData,
    setErrors,
    clearErrors,
    isSubmitting,
    submitBusiness,
  } = useListBusiness();

  const validateStep = () => {
    const stepErrors = {};
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
      website,
    } = formData;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneDigits = String(phone || "").replace(/\D/g, "");
    const hasDescriptionText =
      String(description || "").replace(/<[^>]*>/g, "").trim().length >= 20;

    const parsedYears = Number(yearsInBusiness);
    const parsedRadius = Number(serviceRadius);
    const parsedRate = Number(hourlyRate);

    if (currentStep === 1) {
      if (!businessName?.trim()) {
        stepErrors.businessName = "Business name is required.";
      }
      if (!serviceType?.trim()) {
        stepErrors.serviceType = "Service type is required.";
      }
      if (!category) {
        stepErrors.category = "Please select a category.";
      }
      if (!yearsInBusiness || Number.isNaN(parsedYears) || parsedYears < 0) {
        stepErrors.yearsInBusiness = "Enter valid years in business.";
      }
      if (!hasDescriptionText) {
        stepErrors.description = "Description must be at least 20 characters.";
      }
    }

    if (currentStep === 2) {
      if (!location?.trim()) {
        stepErrors.location = "Service location is required.";
      }
      if (!serviceRadius || Number.isNaN(parsedRadius) || parsedRadius <= 0) {
        stepErrors.serviceRadius = "Service area must be greater than 0.";
      }
      if (phoneDigits.length < 10) {
        stepErrors.phone = "Enter a valid phone number.";
      }
      if (!emailRegex.test(String(email || "").trim())) {
        stepErrors.email = "Enter a valid email address.";
      }
      if (website?.trim()) {
        try {
          new URL(website);
        } catch {
          stepErrors.website = "Enter a valid URL (https://example.com).";
        }
      }
    }

    if (currentStep === 3) {
      const existingPhotos = Number(existingMediaCounts?.photos || 0);
      const uploadedPhotos = Number(photos?.length || 0);
      const totalPhotos =
        modalMode === "edit" ? existingPhotos + uploadedPhotos : uploadedPhotos;

      if (totalPhotos < 3) {
        stepErrors.photos = "Please add at least 3 photos.";
      }
      if (!hourlyRate || Number.isNaN(parsedRate) || parsedRate <= 0) {
        stepErrors.hourlyRate = "Hourly rate must be greater than 0.";
      }
    }

    if (currentStep === 4 && !plan) {
      stepErrors.plan = "Please choose a plan.";
    }

    setErrors(stepErrors);
    const isValid = Object.keys(stepErrors).length === 0;

    if (!isValid) {
      toast.error("Please fix the highlighted fields.");
    }

    return isValid;
  };

  if (!isOpen) return null;
  const currentMeta = STEP_META[currentStep] || STEP_META[1];

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
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      <div className="relative z-10 mx-4 flex h-[88dvh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-pink-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-transparent bg-clip-text bg-linear-to-r from-[#5B4FE9] to-[#E95FC8]">
                {currentMeta.title}
              </h2>
              <p className="text-xs text-gray-600 mt-1">{currentMeta.subtitle}</p>
            </div>
            <button
              onClick={closeModal}
              disabled={isSubmitting}
              className="rounded-full cursor-pointer p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <X size={22} />
            </button>
          </div>
        </div>

        <div className="px-6 pt-4 mb-4">
          <StepIndicator />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">{renderStep()}</div>

        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <button
            onClick={prevStep}
            disabled={currentStep === 1 || isSubmitting}
            className={`rounded-xl cursor-pointer px-6 py-2 text-sm font-medium transition
              ${
                currentStep === 1 || isSubmitting
                  ? "cursor-not-allowed text-gray-400"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
          >
            Back
          </button>

          <button
            disabled={isSubmitting}
            onClick={() => {
              if (!validateStep()) return;
              clearErrors();
              if (currentStep === 4) {
                submitBusiness();
              } else {
                nextStep();
              }
            }}
            className="flex items-center gap-2 rounded-xl cursor-pointer bg-linear-to-r from-[#5B4FE9] to-[#E95FC8] px-8 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {modalMode === "edit" ? "Updating..." : "Submitting..."}
              </>
            ) : currentStep === 4 ? (
              modalMode === "edit" ? "Update Service" : "Start Subscription"
            ) : (
              "Continue"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
