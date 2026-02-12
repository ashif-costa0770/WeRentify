"use client";

import { createService } from "@/services/services.service";
import { createContext, useContext, useState } from "react";
import { toast } from "sonner";

const ListBusinessContext = createContext(null);

// ✅ Custom hook (clean usage everywhere)
export const useListBusiness = () => {
  const context = useContext(ListBusinessContext);
  if (!context) {
    throw new Error("useListBusiness must be used inside ListBusinessProvider");
  }
  return context;
};

export function ListBusinessProvider({ children }) {
  /* ---------------- MODAL STATE ---------------- */
  const [isOpen, setIsOpen] = useState(false);

  /* ---------------- STEP STATE ---------------- */
  const [currentStep, setCurrentStep] = useState(1);

  /* ---------------- error ---------------- */
  const [errors, setErrors] = useState({});

  /* ---------------- FORM DATA ---------------- */
  const [formData, setFormData] = useState({
    // STEP 1 – Business Info
    businessName: "",
    serviceType: "",
    category: "",
    yearsInBusiness: "",
    description: "",

    // STEP 2 – Contact & Location
    location: "",
    serviceRadius: "",
    phone: "",
    email: "",
    website: "",
    certifications: "",

    // STEP 3 – Showcase
    hourlyRate: "",
    photos: [], // File[]
    videos: [], // File[]

    // STEP 4 – Plan
    plan: "", // basic | plus | pro
  });

  /* ---------------- MODAL CONTROLS ---------------- */
  const openModal = () => setIsOpen(true);

  /* ---------------- Clear Error ---------------- */
  const clearErrors = () => setErrors({});

  const closeModal = () => {
    setIsOpen(false);
    clearErrors();
    // ⚠️ state persists (as you requested)
  };

  /* ---------------- STEP CONTROLS ---------------- */
  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const goToStep = (step) => {
    setCurrentStep(step);
  };
  const resetStep = () => {
    setCurrentStep(1);
  };

  /* ---------------- FORM UPDATE ---------------- */
  const updateFormData = (data) => {
    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
  };

  /* ---------------- file uploads ---------------- */
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

  /* ---------------- FINAL SUBMIT ---------------- */
  const submitBusiness = async () => {
    try {
      const payload = new FormData();

      Object.entries(formData).forEach(([key, value]) => {
        if (key === "photos" || key === "videos") {
          value.forEach((file) => {
            payload.append(key, file);
          });
        } else {
          payload.append(key, value ?? "");
        }
      });

      await createService(payload);
      toast.success("🎉 Service added successfully!")
    } catch (error) {
      console.log("FULL ERROR:", error.response?.data);
      toast.error("Error in creating service!")
    }
  };

  return (
    <ListBusinessContext.Provider
      value={{
        // modal
        isOpen,
        openModal,
        closeModal,

        // steps
        currentStep,
        nextStep,
        prevStep,
        goToStep,
        resetStep,

        // form
        formData,
        setFormData,
        errors,
        setErrors,
        clearErrors,
        updateFormData,

        // file uploads
        addFiles,
        removeFile,

        // submit
        submitBusiness,
      }}
    >
      {children}
    </ListBusinessContext.Provider>
  );
}
