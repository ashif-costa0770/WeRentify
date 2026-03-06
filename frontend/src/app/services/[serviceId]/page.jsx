"use client";

import { useEffect, useState } from "react";
import { Suspense } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import {
  Star,
  MapPin,
  CheckCircle,
  Calendar,
  XCircle,
  MessageCircle,
} from "lucide-react";
import Navbar from "@/app/_components/navbar/Navbar";
import { useUser } from "@/context/UserContext";

import { getServiceById } from "@/services/services.service";
import { mapBackendService } from "../_lib/mapBackendService";
import ServiceBookingModal from "./components/service-booking-modal";

export default function ServiceDetailsPage() {
  const params = useParams();
  const serviceId = params?.serviceId;
  const { isLogin, user, setShowSignIn, setShowMessages, setSelectedConversation } = useUser();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBookingModal, setShowBookingModal] = useState(false);

  const handleOpenBooking = () => {
    if (!isLogin) {
      setShowSignIn(true);
      return;
    }
    setShowBookingModal(true);
  };

  const handleContactProvider = () => {
    if (!isLogin) {
      setShowSignIn(true);
      return;
    }

    const ownerId =
      (typeof service?.owner === "object" ? service.owner?._id : service?.ownerId) || null;
    const isOwnService =
      Boolean(user?._id && ownerId) && String(user._id) === String(ownerId);

    if (isOwnService) {
      toast.error("You cannot message yourself");
      return;
    }

    setSelectedConversation({
      itemId: serviceId,
      itemName: service?.name,
      otherUser: service?.provider,
      refModel: "Service",
    });
    setShowMessages(true);
  };

  useEffect(() => {
    let cancelled = false;

    async function fetchService() {
      if (!serviceId) return;
      setLoading(true);
      setError("");

      try {
        const res = await getServiceById(serviceId);
        const rawService = res?.data?.data?.service || res?.data?.service || null;

        if (!rawService) {
          throw new Error("Service not found");
        }

        if (!cancelled) {
          setService(mapBackendService(rawService));
        }
      } catch (fetchError) {
        if (!cancelled) {
          setError(fetchError?.response?.data?.message || fetchError?.message || "Failed to load service");
          setService(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchService();

    return () => {
      cancelled = true;
    };
  }, [serviceId]);

  if (loading) {
    return (
      <div className="mx-auto flex min-h-[55vh] w-full max-w-4xl items-center justify-center px-4">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600" />
          <p className="mt-4 text-gray-600">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (error || !service) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-10">
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error || "Service not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 z-50 mx-auto bg-gray-100 shadow-lg">
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
      </div>

      <div className="mx-auto w-full max-w-4xl px-4 py-10 mb-10">
        <div className="rounded-3xl bg-white p-6 shadow-xl">
          <div className="flex-col items-start gap-4">
            <div className="mb-8 flex h-25 w-25 items-center justify-center overflow-hidden rounded-xl">
              {service.image ? (
                <Image
                  src={service.image}
                  alt={service.name}
                  height={200}
                  width={200}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-5xl">Service</span>
              )}
            </div>

            <div className="px-2">
              <h1 className="text-2xl font-bold text-gray-900">{service.name}</h1>
              <p className="text-gray-600">
                by <span className="font-medium">{service.provider}</span>
              </p>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 text-md text-gray-600">
                <div className="flex items-center gap-1">
                  <Star size={16} className="fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold text-gray-900">{service.rating}</span>
                  <span>({service.reviews} reviews)</span>
                </div>

                <div className="flex items-center gap-1">
                  <MapPin size={16} />
                  <span>{service.distance} miles away</span>
                </div>

                {service.verified ? (
                  <div className="flex items-center gap-1 text-green-600">
                    <CheckCircle size={16} />
                    <span className="font-medium">Verified Provider</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-red-600">
                    <XCircle size={16} />
                    <span className="font-medium">Not Verified</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-orange-50 p-5">
            <p className="text-3xl font-extrabold text-orange-600">${service.hourlyRate}/hour</p>
            <div
              className="mt-1 text-sm text-gray-700"
              dangerouslySetInnerHTML={{ __html: service.description }}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <button
              onClick={handleOpenBooking}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-500 to-pink-500 px-6 py-4 font-semibold text-white transition hover:opacity-90"
            >
              <Calendar size={18} />
              Book Now
            </button>

            <button
              onClick={handleContactProvider}
              className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-orange-500 px-6 py-4 font-semibold text-orange-600 transition hover:bg-orange-50"
            >
              <MessageCircle size={18} />
              Contact Provider
            </button>
          </div>
        </div>
      </div>

      <ServiceBookingModal
        service={service}
        open={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />
    </div>
  );
}
