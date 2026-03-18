"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  BriefcaseBusiness,
  Loader2,
  Package,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import { useListBusiness } from "@/context/ListBusinessContext";
import { deleteListing, getListingsByUser } from "@/services/item.service";
import { deleteService, getServicesByUser } from "@/services/services.service";
import ConfirmDeleteModal from "@/app/_components/modals/confirmDeleteModal";
import ListItemModal from "@/app/_components/modals/listItemModal/ListItemModal";
import ListBusinessModal from "@/app/services/_components/modals/ListBusinessModal";

const getArrayFromResponse = (response, fallbackKey) => {
  const payload = response?.data;
  const nestedData = payload?.data;

  if (Array.isArray(nestedData)) return nestedData;
  if (Array.isArray(payload?.[fallbackKey])) return payload[fallbackKey];
  if (Array.isArray(nestedData?.[fallbackKey])) return nestedData[fallbackKey];

  return [];
};

const isNotFoundError = (error) => Number(error?.response?.status) === 404;

const formatCurrency = (value, suffix) => {
  const amount = Number(value || 0);
  return `$${amount.toLocaleString()}${suffix}`;
};

export default function MyListings() {
  const { isLogin, setShowSignIn } = useUser();
  const { openModal, registerSuccessCallback } = useListBusiness();
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [services, setServices] = useState([]);
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    const [listingsRes, servicesRes] = await Promise.allSettled([
      getListingsByUser(),
      getServicesByUser(),
    ]);

    if (listingsRes.status === "fulfilled") {
      setListings(getArrayFromResponse(listingsRes.value, "listings"));
    } else if (!isNotFoundError(listingsRes.reason)) {
      setError(
        listingsRes.reason?.response?.data?.message ||
          "Failed to load your listings",
      );
    } else {
      setListings([]);
    }

    if (servicesRes.status === "fulfilled") {
      setServices(getArrayFromResponse(servicesRes.value, "services"));
    } else if (!isNotFoundError(servicesRes.reason)) {
      setError(
        servicesRes.reason?.response?.data?.message ||
          "Failed to load your services",
      );
    } else {
      setServices([]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    registerSuccessCallback(loadData);
  }, [loadData, registerSuccessCallback]);

  const totalItems = useMemo(
    () => (listings?.length || 0) + (services?.length || 0),
    [listings, services],
  );

  const totalBookings = useMemo(() => {
    const listingBookings = listings.reduce(
      (sum, listing) => sum + Number(listing?.bookings || 0),
      0,
    );
    const serviceBookings = services.reduce(
      (sum, service) => sum + Number(service?.bookings || 0),
      0,
    );

    return listingBookings + serviceBookings;
  }, [listings, services]);

  const handleEdit = (type, item) => {
    if (!isLogin) {
      setShowSignIn(true);
      return;
    }

    if (type === "listing") {
      setEditingListing(item);
      setIsListingModalOpen(true);
      return;
    }

    openModal({ mode: "edit", service: item });
  };

  const handleAddListing = () => {
    if (!isLogin) {
      setShowSignIn(true);
      return;
    }
    setEditingListing(null);
    setIsListingModalOpen(true);
  };

  const handleAddService = () => {
    if (!isLogin) {
      setShowSignIn(true);
      return;
    }
    openModal({ mode: "create" });
  };

  const handleDeleteClick = ({ id, type, name }) => {
    setDeleteTarget({ id, type, name });
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget?.id || !deleteTarget?.type) return;

    try {
      setIsDeleting(true);

      if (deleteTarget.type === "listing") {
        await deleteListing(deleteTarget.id);
        setListings((prev) =>
          prev.filter((item) => String(item?._id) !== String(deleteTarget.id)),
        );
        toast.success("Listing deleted successfully");
      } else {
        await deleteService(deleteTarget.id);
        setServices((prev) =>
          prev.filter((item) => String(item?._id) !== String(deleteTarget.id)),
        );
        toast.success("Service deleted successfully");
      }

      setDeleteTarget(null);
    } catch (deleteError) {
      const message =
        deleteError?.response?.data?.message ||
        `Failed to delete ${deleteTarget.type}`;
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <section className="rounded-2xl border border-gray-200 bg-white py-16 text-center shadow-sm">
        <div className="flex items-center justify-center gap-2 text-gray-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading your listings...
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              My Listings
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Manage your active rental listings and services.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700">
              <Sparkles size={14} />
              {totalItems} total
            </div>
            <div className="inline-flex items-center rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-sm font-medium text-blue-700">
              {totalBookings} bookings
            </div>
          </div>
        </div>
      </section>

      {error ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 px-6 py-4 text-sm text-red-700 shadow-sm">
          {error}
        </section>
      ) : null}

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">
              Rental Listings
            </h3>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
              {listings.length}
            </span>
          </div>
          <button
            type="button"
            onClick={handleAddListing}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
          >
            <Plus size={13} />
            Add Listing
          </button>
        </div>

        {listings.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
            No rental listings yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {listings.map((listing) => {
              const imageUrl = listing?.photos?.[0]?.url || listing?.imageUrl;
              const listingName =
                listing?.itemName || listing?.name || "Unnamed listing";
              const location = listing?.pickupLocation || "Location not set";
              const price = listing?.dailyRate || listing?.hourlyRate || 0;

              return (
                <article
                  key={listing?._id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative aspect-[16/10] bg-gray-100">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={listingName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-gray-400">
                        No image
                      </div>
                    )}
                    <span className="absolute right-3 top-3 inline-flex rounded-full border border-emerald-300 bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                      {Number(listing?.bookings || 0)} bookings
                    </span>
                  </div>

                  <div className="space-y-1 p-3">
                    <div className="flex items-center gap-2">
                      <Package size={14} className="text-indigo-600" />
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {listingName}
                      </p>
                    </div>
                    <p className="truncate text-xs text-gray-500">{location}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-indigo-600">
                        {formatCurrency(
                          price,
                          listing?.dailyRate ? "/day" : "/hr",
                        )}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit("listing", listing)}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                          <Pencil size={13} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteClick({
                              id: listing?._id,
                              type: "listing",
                              name: listingName,
                            })
                          }
                          className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">Services</h3>
            <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-700">
              {services.length}
            </span>
          </div>
          <button
            type="button"
            onClick={handleAddService}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
          >
            <Plus size={13} />
            Add Service
          </button>
        </div>

        {services.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
            No services yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => {
              const imageUrl = service?.photos?.[0]?.url || service?.imageUrl;
              const serviceName =
                service?.businessName ||
                service?.serviceType ||
                "Unnamed service";
              const location = service?.location || "Location not set";

              return (
                <article
                  key={service?._id}
                  className="overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="relative aspect-[16/10] bg-gray-100">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={serviceName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-xs text-gray-400">
                        No image
                      </div>
                    )}
                    <span className="absolute right-3 top-3 inline-flex rounded-full border border-emerald-300 bg-emerald-600 px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                      {Number(service?.bookings || 0)} bookings
                    </span>
                  </div>

                  <div className="space-y-1 p-3">
                    <div className="flex items-center gap-2">
                      <BriefcaseBusiness
                        size={14}
                        className="text-indigo-600"
                      />
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {serviceName}
                      </p>
                    </div>
                    <p className="truncate text-xs text-gray-500">{location}</p>
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-indigo-600">
                        {formatCurrency(service?.hourlyRate, "/hr")}
                      </p>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit("service", service)}
                          className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                        >
                          <Pencil size={13} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteClick({
                              id: service?._id,
                              type: "service",
                              name: serviceName,
                            })
                          }
                          className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                        >
                          <Trash2 size={13} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        title={`Delete ${deleteTarget?.type || "item"}`}
        message={`Are you sure you want to delete \"${deleteTarget?.name || "this item"}\"? This action cannot be undone.`}
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        isLoading={isDeleting}
        onClose={() => {
          if (isDeleting) return;
          setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
      />

      <ListItemModal
        isOpen={isListingModalOpen}
        mode={editingListing ? "edit" : "create"}
        initialData={editingListing}
        onClose={() => {
          setIsListingModalOpen(false);
          setEditingListing(null);
        }}
        onListingCreated={loadData}
      />
      <ListBusinessModal />
    </div>
  );
}
