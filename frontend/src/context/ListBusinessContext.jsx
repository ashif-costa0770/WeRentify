"use client";

import { createContext, useContext, useRef, useState } from "react";
import { toast } from "sonner";
import { createService, updateService } from "@/services/services.service";

const ListBusinessContext = createContext(null);

const EMPTY_FORM_DATA = {
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
};

const mapServiceToFormData = (service = {}) => ({
  ...EMPTY_FORM_DATA,
  businessName: service?.businessName || "",
  serviceType: service?.serviceType || "",
  category:
    typeof service?.category === "object"
      ? service?.category?._id || ""
      : service?.category || "",
  yearsInBusiness: service?.yearsInBusiness ?? "",
  description: service?.description || "",
  location: service?.location || "",
  serviceRadius: service?.serviceRadius ?? "",
  phone: service?.phone || "",
  email: service?.email || "",
  website: service?.website || "",
  certifications: service?.certifications || "",
  hourlyRate: service?.hourlyRate ?? "",
  photos: [],
  videos: [],
  plan: service?.plan || "basic",
});

export const useListBusiness = () => {
  const context = useContext(ListBusinessContext);
  if (!context) {
    throw new Error("useListBusiness must be used inside ListBusinessProvider");
  }
  return context;
};

export function ListBusinessProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingServiceId, setEditingServiceId] = useState(null);
  const [existingMediaCounts, setExistingMediaCounts] = useState({
    photos: 0,
    videos: 0,
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(EMPTY_FORM_DATA);

  const successCallbackRef = useRef(null);

  const registerSuccessCallback = (fn) => {
    successCallbackRef.current = fn;
  };

  const clearErrors = () => setErrors({});
  const resetStep = () => setCurrentStep(1);

  const openModal = (options = {}) => {
    const mode = options?.mode === "edit" ? "edit" : "create";
    const service = options?.service || null;

    setModalMode(mode);
    setCurrentStep(1);
    clearErrors();

    if (mode === "edit" && service?._id) {
      setEditingServiceId(service._id);
      setExistingMediaCounts({
        photos: Array.isArray(service?.photos) ? service.photos.length : 0,
        videos: Array.isArray(service?.videos) ? service.videos.length : 0,
      });
      setFormData(mapServiceToFormData(service));
    } else {
      setEditingServiceId(null);
      setExistingMediaCounts({ photos: 0, videos: 0 });
      setFormData(EMPTY_FORM_DATA);
    }

    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalMode("create");
    setEditingServiceId(null);
    setExistingMediaCounts({ photos: 0, videos: 0 });
    setFormData(EMPTY_FORM_DATA);
    resetStep();
    clearErrors();
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const goToStep = (step) => setCurrentStep(step);

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

      if (modalMode === "edit") {
        if (!editingServiceId) {
          throw new Error("Missing service id for edit operation");
        }
        await updateService(editingServiceId, payload);
        toast.success("Service updated successfully!");
      } else {
        await createService(payload);
        toast.success("Service added successfully!");
      }

      closeModal();

      if (successCallbackRef.current) {
        successCallbackRef.current();
      }
    } catch (error) {
      console.log("FULL ERROR:", error?.response?.data || error?.message);
      const message =
        error?.response?.data?.message ||
        (modalMode === "edit"
          ? "Error in updating service!"
          : "Error in creating service!");
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ListBusinessContext.Provider
      value={{
        isOpen,
        modalMode,
        editingServiceId,
        existingMediaCounts,
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
        registerSuccessCallback,
      }}
    >
      {children}
    </ListBusinessContext.Provider>
  );
}
