"use client";

import { useState, useRef } from "react";
import { X } from "lucide-react";
import Step1Photos from "./steps/Step1Photos";
import Step2Details from "./steps/Step2Details";
import Step3Pricing from "./steps/Step3Pricing";
import Step4Availability from "./steps/Step4Availability";
import Step5Stripe from "./steps/Step5Stripe";

export default function ListItemModal({ isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    photos: Array(6).fill(null),
    videos: Array(2).fill(null),
    itemName: "",
    category: "",
    description: "",
    pickupLocation: "",
    hourlyRate: "",
    dailyRate: "",
    weeklyRate: "",
    isAvailable: true,
    offerDelivery: false,
    stripeConnected: false
  });

  const [photoPreviews, setPhotoPreviews] = useState(Array(6).fill(null));
  const [videoPreviews, setVideoPreviews] = useState(Array(2).fill(null));
  const [videoFileNames, setVideoFileNames] = useState(Array(2).fill(null));
  
  // ✅ Fixed refs
  const photoInputRefs = useRef([]);
  const videoInputRefs = useRef([]);

  // ... rest of your component

  if (!isOpen) return null;

  const totalSteps = 5;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        const photoCount = formData.photos.filter(p => p !== null).length;
        return photoCount >= 3;
      case 2:
        return formData.itemName && formData.category && formData.description && formData.pickupLocation;
      case 3:
        return formData.dailyRate !== "";
      case 5:
        return formData.stripeConnected;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert("Listing added successfully!");
    console.log("Listing submitted:", formData);
    setIsSubmitting(false);
    onClose();
    // Reset
    setCurrentStep(1);
    setFormData({
      photos: Array(6).fill(null),
      videos: Array(2).fill(null),
      itemName: "",
      category: "",
      description: "",
      pickupLocation: "",
      hourlyRate: "",
      dailyRate: "",
      weeklyRate: "",
      isAvailable: true,
      offerDelivery: false,
      stripeConnected: false
    });
    setPhotoPreviews(Array(6).fill(null));
    setVideoPreviews(Array(2).fill(null));
    setVideoFileNames(Array(2).fill(null));
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1: return "Upload Photos & Videos";
      case 2: return "Item Details";
      case 3: return "Set Your Pricing";
      case 4: return "Availability & Delivery";
      case 5: return "Connect Stripe for Payouts";
      default: return "";
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1: return "Add at least 3 photos of your item (videos optional)";
      case 2: return "Tell us about your item";
      case 3: return "How much do you want to charge?";
      case 4: return "Set your rental terms";
      case 5: return "One-time setup to receive payments";
      default: return "";
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i + 1 <= currentStep 
              ? "w-8 bg-[#5B4FE9]" 
              : "w-2 bg-gray-200"
          }`}
        />
      ))}
    </div>
  );

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Photos 
            formData={formData} 
            setFormData={setFormData}
            photoPreviews={photoPreviews}
            setPhotoPreviews={setPhotoPreviews}
            videoPreviews={videoPreviews}
            setVideoPreviews={setVideoPreviews}
            videoFileNames={videoFileNames}
            setVideoFileNames={setVideoFileNames}
            photoInputRefs={photoInputRefs}
            videoInputRefs={videoInputRefs}
          />
        );
      case 2:
        return <Step2Details formData={formData} setFormData={setFormData} />;
      case 3:
        return <Step3Pricing formData={formData} setFormData={setFormData} />;
      case 4:
        return <Step4Availability formData={formData} setFormData={setFormData} />;
      case 5:
        return <Step5Stripe formData={formData} setFormData={setFormData} />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white px-8 pt-4 pb-2 z-20">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-3xl font-extrabold text-gray-800">{getStepTitle()}</h2>
              <p className="text-gray-500 mt-1 text-sm">{getStepSubtitle()}</p>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 group"
            >
              <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
            </button>
          </div>
          
          {renderStepIndicator()}
        </div>

        {/* Form Content */}
        <div className="px-8 py-4 ">
          {renderStep()}
        </div>

        {/* Footer Navigation */}
        <div className="sticky bottom-0 bg-white px-8 py-6 border-t border-gray-100 flex gap-4">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 py-3.5 px-6 cursor-pointer rounded-xl font-semibold text-gray-700 bg-white border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            disabled={!validateStep(currentStep) || isSubmitting}
            className={`flex-1 py-3.5 px-6 cursor-pointer rounded-xl font-bold text-white transition-all duration-200 ${
              currentStep === totalSteps && formData.stripeConnected
                ? "bg-linear-to-r from-green-500 to-emerald-500 hover:shadow-lg hover:shadow-green-500/25"
                : "bg-linear-to-r from-[#5B4FE9] to-[#9F4AE8] hover:shadow-lg hover:shadow-purple-500/25"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isSubmitting ? "Publishing..." : currentStep === totalSteps ? "Publish Listing" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}