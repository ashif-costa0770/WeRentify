"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import Step1Photos from "./steps/Step1Photos";
import Step2Details from "./steps/Step2Details";
import Step3Pricing from "./steps/Step3Pricing";
import Step4Availability from "./steps/Step4Availability";
import Step5Stripe from "./steps/Step5Stripe";
import { createListing, updateListing } from "@/services/item.service";
import { useUser } from "@/context/UserContext";
import { toast } from "sonner";

const EMPTY_FORM_DATA = {
  photos: Array(6).fill(null),
  videos: Array(2).fill(null),
  itemName: "",
  category: "",
  description: "",
  features: [],
  rentalRules: [],
  cancellationPolicy: "",
  pickupLocation: "",
  hourlyRate: "",
  dailyRate: "",
  weeklyRate: "",
  isAvailable: true,
  offerDelivery: false,
  deliveryFee: "",
  stripeConnected: false,
};

const getCategoryId = (category) => {
  if (!category) return "";
  if (typeof category === "object") return category?._id || "";
  return category;
};

const getInitialFormData = (initialData, mode) => {
  if (mode !== "edit" || !initialData) {
    return { ...EMPTY_FORM_DATA };
  }

  return {
    ...EMPTY_FORM_DATA,
    itemName: initialData?.itemName || initialData?.name || "",
    category: getCategoryId(initialData?.category),
    description: initialData?.description || "",
    features: Array.isArray(initialData?.features) ? initialData.features : [],
    rentalRules: Array.isArray(initialData?.rentalRules)
      ? initialData.rentalRules
      : [],
    cancellationPolicy: initialData?.cancellationPolicy || "",
    pickupLocation: initialData?.pickupLocation || "",
    hourlyRate: initialData?.hourlyRate ?? "",
    dailyRate: initialData?.dailyRate ?? "",
    weeklyRate: initialData?.weeklyRate ?? "",
    isAvailable:
      typeof initialData?.isAvailable === "boolean"
        ? initialData.isAvailable
        : true,
    offerDelivery: Boolean(initialData?.offerDelivery),
    deliveryFee: initialData?.deliveryFee ?? "",
    stripeConnected: true,
  };
};

const getInitialPhotoPreviews = (initialData, mode) => {
  const previews = Array(6).fill(null);
  if (mode !== "edit" || !Array.isArray(initialData?.photos)) return previews;

  initialData.photos.slice(0, 6).forEach((photo, index) => {
    previews[index] = photo?.url || null;
  });

  return previews;
};

const getInitialVideoPreviews = (initialData, mode) => {
  const previews = Array(2).fill(null);
  if (mode !== "edit" || !Array.isArray(initialData?.videos)) return previews;

  initialData.videos.slice(0, 2).forEach((video, index) => {
    previews[index] = video?.url || null;
  });

  return previews;
};

const getInitialVideoFileNames = (initialData, mode) => {
  const names = Array(2).fill(null);
  if (mode !== "edit" || !Array.isArray(initialData?.videos)) return names;

  initialData.videos.slice(0, 2).forEach((video, index) => {
    const url = video?.url || "";
    names[index] = url ? url.split("/").pop() : `video-${index + 1}`;
  });

  return names;
};

const appendFormDataField = (form, key, value) => {
  if (value === undefined || value === null || value === "") return;

  if (Array.isArray(value)) {
    value.forEach((item) => {
      if (item === undefined || item === null || item === "") return;
      form.append(key, item);
    });
    return;
  }

  form.append(key, value);
};

export default function ListItemModal({
  isOpen,
  onClose,
  onListingCreated,
  mode = "create",
  initialData = null,
}) {
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState(() =>
    getInitialFormData(initialData, mode),
  );
  const [photoPreviews, setPhotoPreviews] = useState(() =>
    getInitialPhotoPreviews(initialData, mode),
  );
  const [videoPreviews, setVideoPreviews] = useState(() =>
    getInitialVideoPreviews(initialData, mode),
  );
  const [videoFileNames, setVideoFileNames] = useState(() =>
    getInitialVideoFileNames(initialData, mode),
  );

  const photoInputRefs = useRef([]);
  const videoInputRefs = useRef([]);

  useEffect(() => {
    if (!isOpen) return;

    setCurrentStep(1);
    setFormData(getInitialFormData(initialData, mode));
    setPhotoPreviews(getInitialPhotoPreviews(initialData, mode));
    setVideoPreviews(getInitialVideoPreviews(initialData, mode));
    setVideoFileNames(getInitialVideoFileNames(initialData, mode));
  }, [isOpen, initialData, mode]);

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
      case 1: {
        if (mode === "edit") return true;
        const photoCount = formData.photos.filter((p) => p !== null).length;
        return photoCount >= 3;
      }
      case 2:
        return (
          formData.itemName &&
          formData.category &&
          formData.description &&
          formData.pickupLocation
        );
      case 3:
        return formData.dailyRate !== "";
      case 5:
        return mode === "edit" ? true : formData.stripeConnected;
      default:
        return true;
    }
  };

  const resetModal = () => {
    setCurrentStep(1);
    setFormData({ ...EMPTY_FORM_DATA });
    setPhotoPreviews(Array(6).fill(null));
    setVideoPreviews(Array(2).fill(null));
    setVideoFileNames(Array(2).fill(null));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const normalizeToArray = (value) => {
        if (Array.isArray(value)) {
          return value.map((item) => String(item).trim()).filter(Boolean);
        }

        if (typeof value === "string") {
          return value
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean);
        }

        return [];
      };

      const listingFields = {
        itemName: formData.itemName,
        category: formData.category,
        description: formData.description,
        features: normalizeToArray(formData.features),
        rentalRules: normalizeToArray(formData.rentalRules),
        cancellationPolicy: formData.cancellationPolicy,
        pickupLocation: formData.pickupLocation,
        hourlyRate: formData.hourlyRate,
        dailyRate: formData.dailyRate,
        weeklyRate: formData.weeklyRate,
        deliveryFee: formData.deliveryFee,
      };

      const photos = (formData.photos || []).filter(Boolean);
      const videos = (formData.videos || []).filter(Boolean);

      if (mode !== "edit" && photos.length < 3) {
        toast.error("Please attach at least 3 photos.");
        setIsSubmitting(false);
        return;
      }

      if (mode === "edit") {
        const listingId = initialData?._id || initialData?.id;
        if (!listingId) {
          toast.error("Missing listing id for update.");
          setIsSubmitting(false);
          return;
        }

        const payload = new FormData();
        Object.entries(listingFields).forEach(([key, value]) => {
          appendFormDataField(payload, key, value);
        });

        photos.forEach((file) => payload.append("photos", file));
        videos.forEach((file) => payload.append("videos", file));

        await updateListing(listingId, payload);
        toast.success("Listing updated successfully");
      } else {
        await createListing(
          {
            ...listingFields,
            owner: user?._id,
          },
          { photos, videos },
        );
        toast.success("Listing created successfully");
      }

      if (onListingCreated) {
        onListingCreated();
      }

      onClose();
      resetModal();
    } catch (err) {
      console.error("Listing submit failed", err);
      let message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        (mode === "edit" ? "Failed to update listing" : "Failed to create listing");

      if (err?.response?.status === 401) {
        message =
          mode === "edit"
            ? "Please log in to update this listing."
            : "Please log in to create a listing.";
      } else if (
        Array.isArray(err?.response?.data?.errors) &&
        err.response.data.errors.length
      ) {
        const first = err.response.data.errors[0];
        message = first?.message || message;
      }

      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return mode === "edit"
          ? "Update Photos & Videos"
          : "Upload Photos & Videos";
      case 2:
        return "Item Details";
      case 3:
        return "Set Your Pricing";
      case 4:
        return "Availability & Delivery";
      case 5:
        return mode === "edit"
          ? "Finalize Listing Update"
          : "Connect Stripe for Payouts";
      default:
        return "";
    }
  };

  const getStepSubtitle = () => {
    switch (currentStep) {
      case 1:
        return mode === "edit"
          ? "Update media if needed (optional)"
          : "Add at least 3 photos of your item (videos optional)";
      case 2:
        return "Tell us about your item";
      case 3:
        return "How much do you want to charge?";
      case 4:
        return "Set your rental terms";
      case 5:
        return mode === "edit"
          ? "Review and save your listing changes"
          : "One-time setup to receive payments";
      default:
        return "";
    }
  };

  const renderStepIndicator = () => (
    <div className="mb-8 flex justify-center gap-2">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i + 1 <= currentStep ? "w-8 bg-[#5B4FE9]" : "w-2 bg-gray-200"
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
    <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/40 p-2 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="relative flex h-[96dvh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl sm:h-auto sm:max-h-[92dvh]">
        <div className="shrink-0 border-b border-gray-100 bg-white px-4 pb-3 pt-4 sm:px-8 sm:pb-2">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-extrabold text-gray-800 sm:text-3xl">
                {getStepTitle()}
              </h2>
              <p className="mt-1 text-sm text-gray-500">{getStepSubtitle()}</p>
            </div>
            <button
              onClick={onClose}
              className="group rounded-full p-2 transition-colors duration-200 hover:bg-gray-100"
            >
              <X className="h-5 w-5 text-gray-400 group-hover:text-gray-600" />
            </button>
          </div>

          {renderStepIndicator()}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 sm:px-8">
          {renderStep()}
        </div>

        <div className="shrink-0 border-t border-gray-100 bg-white px-4 py-4 sm:px-8 sm:py-6">
          <div className="flex gap-3 sm:gap-4">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={handleBack}
                className="flex-1 cursor-pointer rounded-xl border-2 border-gray-200 bg-white px-4 py-3 font-semibold text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 sm:px-6 sm:py-3.5"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={handleNext}
              disabled={!validateStep(currentStep) || isSubmitting}
              className={`flex-1 cursor-pointer rounded-xl px-4 py-3 font-bold text-white transition-all duration-200 sm:px-6 sm:py-3.5 ${
                currentStep === totalSteps && (formData.stripeConnected || mode === "edit")
                  ? "bg-linear-to-r from-green-500 to-emerald-500 hover:shadow-lg hover:shadow-green-500/25"
                  : "bg-linear-to-r from-[#5B4FE9] to-[#9F4AE8] hover:shadow-lg hover:shadow-purple-500/25"
              } disabled:cursor-not-allowed disabled:opacity-50`}
            >
              {isSubmitting
                ? mode === "edit"
                  ? "Updating..."
                  : "Publishing..."
                : currentStep === totalSteps
                  ? mode === "edit"
                    ? "Update Listing"
                    : "Publish Listing"
                  : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
