"use client";

import { createService } from "@/services/services.service";
import { createContext, useContext, useState, useRef } from "react"; // ✅ useRef added
import { toast } from "sonner";

const ListBusinessContext = createContext(null);

export const useListBusiness = () => {
  const context = useContext(ListBusinessContext);
  if (!context) {
    throw new Error("useListBusiness must be used inside ListBusinessProvider");
  }
  return context;
};

export function ListBusinessProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Holds the refetch function registered by the services page
  const successCallbackRef = useRef(null);

  const registerSuccessCallback = (fn) => {
    successCallbackRef.current = fn;
  };

  const [formData, setFormData] = useState({
    businessName: "",
    serviceType: "",
    category: "",
    yearsInBusiness: "",
    description: "",
    location: "",
    serviceRadius: "",
    phone: "",
    email: "",
    website: "",
    certifications: "",
    hourlyRate: "",
    photos: [],
    videos: [],
    plan: "",
  });

  const openModal = () => setIsOpen(true);
  const clearErrors = () => setErrors({});

  const closeModal = () => {
    setIsOpen(false);
    clearErrors();
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const goToStep = (step) => setCurrentStep(step);
  const resetStep = () => setCurrentStep(1);

  const updateFormData = (data) => {
    setFormData((prev) => ({ ...prev, ...data }));
  };

  const addFiles = (type, files) => {
    setFormData((prev) => {
      const existing = prev[type];
      const max = type === "photos" ? 6 : 2;
      const merged = [...existing, ...Array.from(files)].slice(0, max);
      return { ...prev, [type]: merged };
    });
  };

  const removeFile = (type, index) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const submitBusiness = async () => {
    setIsSubmitting(true);
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (key === "photos" || key === "videos") {
          value.forEach((file) => payload.append(key, file));
        } else {
          payload.append(key, value ?? "");
        }
      });

      await createService(payload);

      toast.success("Service added successfully!");

      closeModal();
      setFormData({
        businessName: "",
        serviceType: "",
        category: "",
        yearsInBusiness: "",
        description: "",
        location: "",
        serviceRadius: "",
        phone: "",
        email: "",
        website: "",
        certifications: "",
        hourlyRate: "",
        photos: [],
        videos: [],
        plan: "",
      });
      resetStep();

      // ✅ Trigger the page's fetchServices instead of router.push
      if (successCallbackRef.current) {
        successCallbackRef.current();
      }
    } catch (error) {
      console.log("FULL ERROR:", error.response?.data);
      toast.error("Error in creating service!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ListBusinessContext.Provider
      value={{
        isOpen,
        openModal,
        closeModal,
        currentStep,
        nextStep,
        prevStep,
        goToStep,
        resetStep,
        formData,
        setFormData,
        errors,
        setErrors,
        clearErrors,
        updateFormData,
        addFiles,
        removeFile,
        isSubmitting,
        submitBusiness,
        registerSuccessCallback, // ✅ exposed
      }}
    >
      {children}
    </ListBusinessContext.Provider>
  );
}
