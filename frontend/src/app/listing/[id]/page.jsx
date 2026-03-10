"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useUser } from "@/context/UserContext";
import DOMPurify from "dompurify";
import { toast } from "sonner";
import { shareOrCopyLink } from "@/utils/shareLink";
import { getListingById, getListings } from "@/services/item.service";
import NavbarWrapper from "@/app/_components/navbar/NavbarWrapper";
import ListingBookingModal from "./components/listing-booking-modal";
import {
  ArrowLeft,
  Star,
  MapPin,
  Heart,
  CheckCircle,
  Check,
  MessageCircle,
  Shield,
  Loader2,
  X,
} from "lucide-react";

const MessageSlider = dynamic(
  () => import("@/app/_components/modals/MessageSlider"),
  { ssr: false },
);
const OwnerProfileModal = dynamic(
  () => import("@/app/_components/modals/OwnerProfileModal"),
  { ssr: false },
);

export default function ListingPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [listing, setListing] = useState(null);
  const [similarListings, setSimilarListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [showOwnerProfile, setShowOwnerProfile] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const {
    favorites,
    addFavorite,
    removeFavorite,
    isLogin,
    setShowSignIn,
    user,
  } = useUser();

  const fetchListing = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setNotFound(false);
    setListing(null);
    try {
      const res = await getListingById(id);
      const data = res?.data?.data ?? res?.data;
      setListing(data || null);
      if (!data) setNotFound(true);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 404) setNotFound(true);
      else toast.error(err?.response?.data?.message || "Failed to load listing");
      setListing(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchListing();
  }, [fetchListing]);

  // Fetch similar listings (same category) for the "Similar items" section
  useEffect(() => {
    if (!listing?.category) return;
    const categoryId =
      typeof listing.category === "object"
        ? listing.category?._id
        : listing.category;
    if (!categoryId) return;

    getListings()
      .then((res) => {
        const list =
          res?.data?.data?.listings ??
          res?.data?.listings ??
          res?.data?.data ??
          res?.data ?? [];
        const arr = Array.isArray(list) ? list : [];
        const similar = arr
          .filter(
            (item) =>
              (item._id || item.id) !== (listing._id || listing.id) &&
              (typeof item.category === "object"
                ? item.category?._id
                : item.category) === categoryId
          )
          .slice(0, 4);
        setSimilarListings(similar);
      })
      .catch(() => setSimilarListings([]));
  }, [listing]);

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <NavbarWrapper />
        <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center gap-4">
          <Loader2 className="size-10 animate-spin text-indigo-600" />
          <p className="text-gray-600 font-medium">Loading listing...</p>
        </div>
      </main>
    );
  }

  if (notFound || !listing) {
    return (
      <main className="min-h-screen bg-gray-50">
        <NavbarWrapper />
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Listing not found
          </h1>
          <p className="text-gray-600 mb-6">
            This listing may have been removed or the link is invalid.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <ArrowLeft size={18} />
            Back to home
          </Link>
        </div>
      </main>
    );
  }

  const ownerName =
    typeof listing.owner === "object"
      ? `${listing.owner?.firstname || ""} ${listing.owner?.lastname || ""}`.trim() ||
        listing.owner?.firstname ||
        "Unknown Owner"
      : listing.owner || "Unknown Owner";
  const ownerId =
    (typeof listing.owner === "object" ? listing.owner?._id : null) ||
    listing.ownerId ||
    listing._id;
  const ownerInitial = ownerName.charAt(0).toUpperCase();
  const selectedCategoryId =
    typeof listing.category === "object"
      ? listing.category?._id
      : listing.category;
  const selectedItemId = listing._id || listing.id;
  const selectedOwnerId =
    (typeof listing.owner === "object" ? listing.owner?._id : listing.ownerId) || null;
  const isOwnListing =
    Boolean(user?._id && selectedOwnerId) &&
    String(user._id) === String(selectedOwnerId);

  const existingFavorite = favorites.find(
    (fav) =>
      String(
        typeof fav.productId === "string"
          ? fav.productId
          : fav.productId?._id ?? fav.productId?.id
      ) === String(selectedItemId) && fav.productType === "Listing"
  );
  const isFavorite = !!existingFavorite;

  const handleFavoriteToggle = async (e) => {
    e?.stopPropagation?.();
    if (!isLogin) {
      setShowSignIn(true);
      return;
    }
    try {
      if (isFavorite) {
        await removeFavorite(existingFavorite._id);
        toast.success("Removed from favorites");
      } else {
        await addFavorite({
          productId: selectedItemId,
          productType: "Listing",
        });
        toast.success("Added to favorites");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Favorite action failed");
    }
  };

  const handleShareClick = async () => {
    const result = await shareOrCopyLink({
      title: listing.itemName || listing.name,
      text: `Check out this ${listing.itemName || listing.name} for rent on WeRentify!`,
      url: typeof window !== "undefined" ? `${window.location.origin}/listing/${selectedItemId}` : `/listing/${selectedItemId}`,
    });
    if (result === "shared") toast.success("Listing shared!");
    else if (result === "copied") toast.success("Link copied to clipboard!");
    else if (result !== "cancelled")
      toast.error("Unable to share listing right now");
  };

  const handleBookNow = () => {
    if (!isLogin) {
      setShowSignIn(true);
      return;
    }
    if (isOwnListing) {
      toast.error("You cannot book your own listing");
      return;
    }
    setShowBookingModal(true);
  };

  const handleMessageOwner = () => {
    if (!isLogin) {
      setShowSignIn(true);
      return;
    }
    if (isOwnListing) {
      toast.error("You cannot message yourself");
      return;
    }
    setSelectedConversation({
      id: Date.now(),
      itemId: selectedItemId,
      itemName: listing.itemName || listing.name,
      otherUser: ownerName,
    });
    setShowMessages(true);
  };

  const handleViewOwner = (ownerData) => {
    setSelectedOwner(ownerData);
    setShowOwnerProfile(true);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <NavbarWrapper />

      <div className="max-w-7xl mx-auto px-6 sm:px-8 py-12">
        {/* Photo gallery - single row, images shrink as count increases, no horizontal scroll */}
        <div className="mb-10">
          {listing.photos?.length > 0 ? (
            (() => {
              const photos = listing.photos.slice(0, 6);
              const count = photos.length;

              return (
                <div className="grid grid-flow-col auto-cols-fr gap-3">
                  {photos.map((photo, idx) => (
                    <div
                      key={idx}
                      className="relative overflow-hidden rounded-xl bg-gray-100 aspect-[4/3]"
                    >
                      {photo?.url && (
                        <Image
                          src={photo.url}
                          alt={listing.itemName || listing.name || "Item"}
                          fill
                          className="object-cover"
                          sizes="(min-width: 1024px) 16vw, 60vw"
                        />
                      )}
                    </div>
                  ))}
                </div>
              );
            })()
          ) : (
            <div className="aspect-video rounded-xl bg-gray-200 flex items-center justify-center text-gray-500">
              No images available
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="md:col-span-2">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-4xl font-black text-gray-900 mb-3">
                      {listing.itemName || listing.name}
                    </h1>
                     
                    <div className="flex items-center gap-4 text-gray-600">
                      <div className="flex items-center gap-1">
                        <Star size={18} className="fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-gray-900">
                          {listing.rating ?? "4.5"}
                        </span>
                        <span className="text-gray-600">
                          ({listing.reviews ?? "0"} reviews)
                        </span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MapPin size={16} />
                        <span>{listing.distance ?? "—"} mi away</span>
                      </div>
                      <span>•</span>
                      <span>{listing.totalRentals ?? 0} rentals</span>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={handleShareClick}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                      >
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M4 12v1a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3v-1" />
                          <polyline points="8 2 8 8" />
                          <polyline points="5 5 8 2 11 5" />
                        </svg>
                        Share
                      </button>
                      <button
                        onClick={handleFavoriteToggle}
                        className="px-4 py-2 rounded-xl font-semibold flex items-center gap-2 text-gray-700 shadow-sm hover:bg-gray-50 transition-all cursor-pointer"
                      >
                        <Heart size={16} className={isFavorite ? "fill-rose-500 text-rose-500" : "text-gray-600"} />
                        {isFavorite ? "Saved" : "Save"}
                      </button>
                    </div>
                
                  </div>                  
                    <div className="bg-linear-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                      <CheckCircle size={16} /> Verified Owner
                    </div>                  
                </div>

                <section className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">Description</h2>
                  <div className="text-gray-700 leading-relaxed prose prose-sm max-w-none">
                    {listing.description ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(listing.description, {
                            ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li", "a", "span"],
                            ALLOWED_ATTR: ["href", "target", "rel", "class"],
                          }),
                        }}
                      />
                    ) : (
                      <p>No description available</p>
                    )}
                  </div>
                </section>

                {listing.features?.length > 0 && (
                  <section className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-3">Features & Details</h2>
                    <div className="grid grid-cols-2 gap-3">
                      {listing.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl">
                          <Check size={18} className="text-green-600" />
                          <span className="text-sm font-medium text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {listing.rentalRules?.length > 0 && (
                  <section className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-3">Rental Rules</h2>
                    <ul className="space-y-2">
                      {listing.rentalRules.map((rule, idx) => (
                        <li key={idx} className="flex gap-2 text-gray-700">
                          <span className="text-indigo-600 font-bold">•</span>
                          <span>{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-xl mb-6">
                  <h3 className="font-bold text-gray-900 mb-1">🔄 Cancellation Policy</h3>
                  <div className="text-sm text-gray-700 prose prose-sm max-w-none">
                    {listing.cancellationPolicy ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(listing.cancellationPolicy, {
                            ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br", "ul", "ol", "li", "a", "span"],
                            ALLOWED_ATTR: ["href", "target", "rel", "class"],
                          }),
                        }}
                      />
                    ) : (
                      <p>No cancellation policy provided.</p>
                    )}
                  </div>
                </div>

                <section className="mb-8">
                  <h2 className="text-lg text-gray-900 font-bold mb-2 flex items-center gap-2">
                    <MapPin size={18} /> General Location
                  </h2>
                  <p className="text-sm text-gray-600 mb-3">
                    Exact address provided after booking confirmation
                  </p>
                  <div className="rounded-xl overflow-hidden shadow-sm">
                    {listing.coordinates?.coordinates ? (
                      <iframe
                        width="100%"
                        height="240"
                        loading="lazy"
                        style={{ border: 0 }}
                        src={`https://www.google.com/maps?q=${listing.coordinates.coordinates[1]},${listing.coordinates.coordinates[0]}&output=embed`}
                      />
                    ) : listing.pickupLocation ? (
                      <iframe
                        width="100%"
                        height="240"
                        loading="lazy"
                        style={{ border: 0 }}
                        src={`https://www.google.com/maps?q=${encodeURIComponent(listing.pickupLocation)}&output=embed`}
                      />
                    ) : (
                      <div className="w-full h-60 bg-gray-100 flex items-center justify-center text-gray-500">
                        <MapPin size={32} className="text-gray-400" />
                        <p className="ml-2">Location not available</p>
                      </div>
                    )}
                  </div>
                  {listing.coordinates?.formattedAddress && (
                    <p className="text-sm text-gray-600 mt-2">
                      📍 {listing.coordinates.formattedAddress}
                    </p>
                  )}
                </section>

                {similarListings.length > 0 && (
                  <section>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                      ✨ Similar items in your area
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {similarListings.map((item) => {
                        const itemId = item._id || item.id;
                        const imageUrl = item.photos?.[0]?.url || item.imageUrl;
                        return (
                          <Link
                            key={itemId}
                            href={`/listing/${itemId}`}
                            className="rounded-xl overflow-hidden border border-gray-100 hover:border-gray-200 transition-colors"
                          >
                            <div className="aspect-square bg-gray-200 flex items-center justify-center">
                              {imageUrl ? (
                                <Image
                                  src={imageUrl}
                                  alt={item.itemName || item.name || "Item"}
                                  width={300}
                                  height={300}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="text-gray-400 text-sm">No image</span>
                              )}
                            </div>
                            <div className="p-3">
                              <h3 className="font-bold text-sm text-gray-900 line-clamp-1">
                                {item.itemName || item.name}
                              </h3>
                              <p className="text-sm font-bold text-indigo-600">
                                ${item.dailyRate ?? item.hourlyRate ?? "0"}/day
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </section>
                )}
              </div>

              {/* Right column - booking card */}
              <div className="md:col-span-1">
                <div className="sticky top-4 bg-white border border-gray-100 rounded-2xl p-6">
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">Pricing</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Hourly</span>
                        <span className="text-xl text-gray-700 font-bold">
                          ${listing.hourlyRate ?? "0"}/hr
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Daily</span>
                        <span className="text-xl font-bold text-indigo-600">
                          ${listing.dailyRate ?? "0"}/day
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Weekly</span>
                        <span className="text-xl text-gray-700 font-bold">
                          ${((listing.dailyRate ?? 0) * 7 * 0.85).toFixed(0)}/wk
                        </span>
                      </div>
                      <p className="text-xs text-green-600 font-semibold mt-2">
                        ✨ Save 15% on weekly rentals
                      </p>
                    </div>
                  </div>

                  <div className="mb-6 pb-6 border-b border-gray-300">
                    <h3 className="font-bold mb-3 text-gray-800 text-lg flex items-center gap-2">🚚 Delivery</h3>
                    {listing.offerDelivery ? (
                      <div className="space-y-2 bg-green-50 p-3 rounded-xl">
                        <div className="flex items-center gap-2 text-green-800">
                          <Check size={16} className="text-green-600" />
                          <span className="font-semibold text-sm">Available</span>
                        </div>
                        <p className="text-sm text-gray-700">
                          Fee: <span className="font-bold">${listing.deliveryFee ?? "0"}</span>
                        </p>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-3 rounded-xl flex items-center gap-2 text-gray-600 text-sm">
                        <X size={16} />
                        <span className="font-semibold">Pickup only</span>
                      </div>
                    )}
                    <p className="text-xs text-gray-600 mt-2">
                      📍 {listing.pickupLocation || "Location"}
                    </p>
                  </div>

                  <div className="mb-6 pb-6 border-b border-gray-300">
                    <button
                      type="button"
                      onClick={() =>
                        handleViewOwner({
                          name: ownerName,
                          ownerId,
                          rating: listing.rating ?? 4.5,
                          totalRentals: listing.totalRentals ?? 0,
                          responseTime: listing.responseTime ?? "1 hour",
                        })
                      }
                      className="w-full text-left hover:bg-gray-50 p-3 rounded-xl transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-linear-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {ownerInitial}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 text-base truncate">
                            Owned by {ownerName}
                          </p>
                          <p className="text-sm text-gray-600">Member since 2023</p>
                          <p className="text-sm text-indigo-600 font-semibold mt-1">View all listings →</p>
                        </div>
                      </div>
                    </button>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="bg-gray-50 p-2 rounded-lg text-center">
                        <p className="text-xs text-gray-600">Response time</p>
                        <p className="font-bold text-gray-600 text-sm">{listing.responseTime ?? "—"}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg text-center">
                        <p className="text-xs text-gray-600">Total rentals</p>
                        <p className="font-bold text-gray-600 text-sm">{listing.totalRentals ?? "0"}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={handleBookNow}
                      disabled={!listing.isAvailable || isOwnListing}
                      className={`w-full py-4 rounded-xl font-bold text-lg cursor-pointer ${
                        !listing.isAvailable || isOwnListing
                          ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                          : "bg-linear-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl"
                      }`}
                    >
                      {!listing.isAvailable ? "Not Available" : isOwnListing ? "Your Listing" : "Book Now"}
                    </button>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={handleFavoriteToggle}
                        className={`py-3 rounded-xl text-gray-700 font-semibold border-2 cursor-pointer ${
                          isFavorite ? "border-rose-500 bg-rose-50 text-rose-600" : "border-gray-400 hover:bg-gray-50"
                        }`}
                      >
                        <Heart size={18} className={`inline mr-2 ${isFavorite ? "fill-rose-500" : ""}`} />
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={handleMessageOwner}
                        disabled={isOwnListing}
                        className={`rounded-xl py-3 font-semibold cursor-pointer ${
                          isOwnListing ? "cursor-not-allowed bg-gray-300 text-gray-600" : "bg-gray-900 text-white"
                        }`}
                      >
                        <MessageCircle size={18} className="inline mr-2" />
                        Message
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-4">
                    <Shield size={12} className="inline mr-1" />
                    Protected by WeRentify guarantee
                  </p>
                </div>
              </div>
            </div>
      </div>

      <MessageSlider
        showMessages={showMessages}
        setShowMessages={setShowMessages}
        selectedConversation={selectedConversation}
      />
      <OwnerProfileModal
        show={showOwnerProfile}
        onClose={() => setShowOwnerProfile(false)}
        owner={selectedOwner}
        items={[]}
        onSelectItem={(item) => {
          setShowOwnerProfile(false);
          router.push(`/listing/${item._id || item.id}`);
        }}
      />
      <ListingBookingModal
        listing={listing}
        open={showBookingModal}
        onClose={() => setShowBookingModal(false)}
      />
    </main>
  );
}
