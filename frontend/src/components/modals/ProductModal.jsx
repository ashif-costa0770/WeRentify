"use client";
import Image from "next/image";
import { useUser } from "@/context/UserContext";
import DOMPurify from "dompurify";

import {
  X,
  Star,
  MapPin,
  Heart,
  CheckCircle,
  Check,
  MessageCircle,
  Shield,
} from "lucide-react";

export default function ProductModal({
  selectedItem,
  setSelectedItem,
  onViewOwner,
  items = [],
  isLoggedIn = false,
  setShowLogin = () => {},
  setShowBooking = () => {},
  setShowMessages = () => {},
  setSelectedConversation = () => {},
}) {
  const { favorites, toggleFavorite } = useUser();

  if (!selectedItem) return null;

  const isFavorite = favorites.some(
    (fav) => fav.id === selectedItem.id && fav.type === "item",
  );

  const handleShareClick = (e) => {
    if (navigator.share) {
      navigator.share({
        title: selectedItem.name,
        text: `Check out this ${selectedItem.name} for rent on WeRentify!`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 p-4">
      <div className="flex items-center justify-center min-h-full">
        <div className="relative bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden">
          {/* Close button */}
          <button
            onClick={() => setSelectedItem(null)}
            className="absolute cursor-pointer top-4 right-4 z-20 bg-white rounded-full p-2 shadow-lg text-gray-400 hover:text-gray-600"
          >
            <X size={24} />
          </button>

          {/* 🔑 Scroll container */}
          <div className="overflow-y-auto max-h-[90vh] p-8">
            {/* Photo Gallery - Horizontal Scroll for all images */}
            <div className="mb-6">
              {selectedItem.photos && selectedItem.photos.length > 0 ? (
                <div className="overflow-x-auto pb-2">
                  <div className="flex gap-3">
                    {selectedItem.photos.map((photo, idx) => (
                      <div
                        key={idx}
                        className="flex-shrink-0 w-40 h-40 aspect-square rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform shadow-md"
                      >
                        {photo?.url && (
                          <Image
                            src={photo.url}
                            alt={
                              selectedItem.itemName ||
                              selectedItem.name ||
                              "Item"
                            }
                            width={500}
                            height={500}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="aspect-video rounded-xl bg-gray-200 flex items-center justify-center text-gray-500">
                  No images available
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {/* LEFT COLUMN */}
              <div className="md:col-span-2">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h1 className="text-4xl font-black text-gray-900 mb-3">
                      {selectedItem.itemName || selectedItem.name}
                    </h1>

                    <div className="flex items-center gap-4 text-gray-600">
                      <div className="flex items-center gap-1">
                        <Star
                          size={18}
                          className="fill-yellow-400 text-yellow-400"
                        />
                        <span className="font-bold text-gray-900">
                          {selectedItem.rating || "4.5"}
                        </span>
                        <span className="text-gray-600">
                          ({selectedItem.reviews || "0"} reviews)
                        </span>
                      </div>

                      <span>•</span>

                      <div className="flex items-center gap-1">
                        <MapPin size={16} />
                        <span>{selectedItem.distance} mi away</span>
                      </div>

                      <span>•</span>
                      <span>{selectedItem.totalRentals} rentals</span>
                    </div>

                    {/* Share + Save */}
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={handleShareClick}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl cursor-pointer font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                      >
                        <svg
                          width="16"
                          height="16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M4 12v1a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3v-1"></path>
                          <polyline points="8 2 8 8"></polyline>
                          <polyline points="5 5 8 2 11 5"></polyline>
                        </svg>
                        Share
                      </button>

                      <button
                        onClick={() => toggleFavorite(selectedItem, "item")}
                        className="px-4 cursor-pointer py-2 rounded-xl font-semibold flex items-center gap-2 text-gray-700 shadow-sm hover:bg-gray-50 transition-all"
                      >
                        <Heart
                          size={16}
                          className={
                            isFavorite
                              ? "fill-rose-500 text-rose-500"
                              : "text-gray-600"
                          }
                        />
                        {isFavorite ? "Saved" : "Save"}
                      </button>
                    </div>
                  </div>

                  {selectedItem.verified && (
                    <div className="bg-linear-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2">
                      <CheckCircle size={16} /> Verified Owner
                    </div>
                  )}
                </div>

                {/* Description */}
                <section className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    Description
                  </h2>
                  <div className="text-gray-700 leading-relaxed prose prose-sm max-w-none">
                    {selectedItem.description ? (
                      <div
                        dangerouslySetInnerHTML={{
                          __html: DOMPurify.sanitize(selectedItem.description, {
                            ALLOWED_TAGS: [
                              "b",
                              "i",
                              "em",
                              "strong",
                              "p",
                              "br",
                              "ul",
                              "ol",
                              "li",
                              "a",
                              "span",
                            ],
                            ALLOWED_ATTR: ["href", "target", "rel", "class"],
                          }),
                        }}
                      />
                    ) : (
                      <p>No description available</p>
                    )}
                  </div>
                </section>

                {/* Features */}
                <section className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    Features & Details
                  </h2>
                  <div className="grid grid-cols-2 gap-3">
                    {selectedItem.features?.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl"
                      >
                        <Check size={18} className="text-green-600" />
                        <span className="text-sm font-medium text-gray-700">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Rental Rules */}
                <section className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    Rental Rules
                  </h2>
                  <ul className="space-y-2">
                    {selectedItem.rentalRules?.map((rule, idx) => (
                      <li key={idx} className="flex gap-2 text-gray-700">
                        <span className="text-indigo-600 font-bold">•</span>
                        <span>{rule}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                {/* Cancellation */}
                <div className="bg-yellow-50 border-2 border-yellow-200 p-4 rounded-xl mb-6">
                  <h3 className="font-bold text-gray-900 mb-1">
                    🔄 Cancellation Policy
                  </h3>
                  <p className="text-sm text-gray-700">
                    {selectedItem.cancellationPolicy}
                  </p>
                </div>

                {/* Location */}
                <section className="mb-8">
                  <h2 className="text-lg text-gray-900  font-bold mb-2 flex items-center gap-2">
                    <MapPin size={18} /> General Location
                  </h2>
                  <p className="text-sm text-gray-600 mb-3">
                    Exact address provided after booking confirmation
                  </p>

                  <div className="rounded-xl overflow-hidden shadow-sm">
                    {selectedItem.coordinates?.coordinates ? (
                      <iframe
                        width="100%"
                        height="240"
                        loading="lazy"
                        style={{ border: 0 }}
                        src={`https://www.google.com/maps?q=${selectedItem.coordinates.coordinates[1]},${selectedItem.coordinates.coordinates[0]}&output=embed`}
                      />
                    ) : selectedItem.pickupLocation ? (
                      <iframe
                        width="100%"
                        height="240"
                        loading="lazy"
                        style={{ border: 0 }}
                        src={`https://www.google.com/maps?q=${encodeURIComponent(selectedItem.pickupLocation)}&output=embed`}
                      />
                    ) : (
                      <div className="w-full h-60 bg-gray-100 flex items-center justify-center text-gray-500">
                        <div className="text-center">
                          <MapPin size={32} className="mx-auto mb-2 text-gray-400" />
                          <p>Location not available</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {selectedItem.coordinates?.formattedAddress && (
                    <p className="text-sm text-gray-600 mt-2">
                      📍 {selectedItem.coordinates.formattedAddress}
                    </p>
                  )}
                </section>

                {/* Similar Items */}
                <section>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    ✨ Similar items in your area
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {items
                      .filter(
                        (item) =>
                          (item._id || item.id) !==
                            (selectedItem._id || selectedItem.id) &&
                          item.category === selectedItem.category &&
                          item.distance <= 5,
                      )
                      .slice(0, 4)
                      .map((item) => {
                        const itemId = item._id || item.id;
                        const imageUrl = item.photos?.[0]?.url || item.imageUrl;
                        return (
                          <div
                            key={itemId}
                            onClick={() => setSelectedItem(item)}
                            className="rounded-xl overflow-hidden cursor-pointer hover:shadow-lg shadow-sm transition-shadow"
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
                                <span className="text-gray-400 text-sm">
                                  No image
                                </span>
                              )}
                            </div>
                            <div className="p-3">
                              <h3 className="font-bold text-sm text-gray-900 line-clamp-1">
                                {item.itemName || item.name}
                              </h3>
                              <p className="text-sm font-bold text-indigo-600">
                                ${item.dailyRate || item.hourlyRate || "0"}/day
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </section>
              </div>

              {/* Right Column - Booking Card */}
              <div className="md:col-span-1">
                <div className="sticky top-4 bg-white border border-gray-100 rounded-2xl p-6 shadow-lg">
                  {/* Pricing */}
                  <div className="mb-6">
                    <h3 className="font-bold text-gray-900 mb-3 text-lg">
                      Pricing
                    </h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Hourly</span>
                        <span className="text-xl text-gray-700 font-bold">
                          ${selectedItem.hourlyRate}/hr
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Daily</span>
                        <span className="text-xl font-bold text-indigo-600">
                          ${selectedItem.dailyRate}/day
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Weekly</span>
                        <span className="text-xl text-gray-700 font-bold">
                          ${(selectedItem.dailyRate * 7 * 0.85).toFixed(0)}/wk
                        </span>
                      </div>
                      <p className="text-xs text-green-600 font-semibold mt-2">
                        ✨ Save 15% on weekly rentals
                      </p>
                    </div>
                  </div>

                  {/* Delivery Options in Sidebar */}
                  <div className="mb-6 pb-6 border-b border-gray-300">
                    <h3 className="font-bold mb-3 text-gray-800 text-lg flex items-center gap-2">
                      🚚 Delivery
                    </h3>
                    {selectedItem.offerDelivery ? (
                      <div className="space-y-2 bg-green-50 p-3 rounded-xl">
                        <div className="flex items-center gap-2 text-green-800">
                          <Check size={16} className="text-green-600" />
                          <span className="font-semibold text-sm">
                            Available
                          </span>
                        </div>
                        <div className="text-sm space-y-1">
                          <p className="text-gray-700">
                            Fee:{" "}
                            <span className="font-bold">
                              ${selectedItem.deliveryFee || "0"}
                            </span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-gray-50 p-3 rounded-xl">
                        <div className="flex items-center gap-2 text-gray-600 text-sm">
                          <X size={16} />
                          <span className="font-semibold">Pickup only</span>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-gray-600 mt-2">
                      📍 {selectedItem.pickupLocation || "Location"}
                    </p>
                  </div>

                  {/* Owner Info - Clickable */}
                  <div className="mb-6 pb-6 border-b border-gray-300">
                    <button
                      onClick={() =>
                        onViewOwner({
                          name: selectedItem.owner || "Unknown Owner",
                          ownerId: selectedItem.ownerId || selectedItem._id,
                          rating: selectedItem.rating || 4.5,
                          totalRentals: selectedItem.totalRentals || 0,
                          responseTime: selectedItem.responseTime || "1 hour",
                        })
                      }
                      className="w-full text-left hover:bg-gray-50 p-3 rounded-xl transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 bg-linear-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {(selectedItem.owner || "U").charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-gray-800 text-base truncate">
                            Owned by {selectedItem.owner || "Unknown Owner"}
                          </p>
                          <p className="text-sm text-gray-600">
                            Member since 2023
                          </p>
                          <p className="text-sm text-indigo-600 cursor-pointer font-semibold mt-1">
                            View all listings →
                          </p>
                        </div>
                      </div>
                    </button>
                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="bg-gray-50 p-2 rounded-lg text-center">
                        <p className="text-xs text-gray-600">Response time</p>
                        <p className="font-bold text-gray-600 text-sm">
                          {selectedItem.responseTime}
                        </p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg text-center">
                        <p className="text-xs text-gray-600">Total rentals</p>
                        <p className="font-bold text-gray-600 text-sm">
                          {selectedItem.totalRentals}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        if (!isLoggedIn) {
                          setShowLogin(true);
                        } else {
                          setShowBooking(true);
                        }
                      }}
                      disabled={!selectedItem.availability}
                      className={`w-full cursor-pointer py-4 rounded-xl font-bold text-lg ${
                        selectedItem.availability
                          ? "bg-linear-to-r from-indigo-600 to-purple-600 text-white hover:shadow-xl"
                          : "bg-gray-300 text-gray-600 cursor-not-allowed"
                      }`}
                    >
                      {selectedItem.availability ? "Book Now" : "Not Available"}
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(selectedItem, "item");
                        }}
                        className={`py-3 cursor-pointer rounded-xl text-gray-700 font-semibold border-2 ${
                          isFavorite
                            ? "border-rose-500 bg-rose-50 text-rose-600"
                            : "border-gray-400 hover:bg-gray-50"
                        }`}
                      >
                        <Heart
                          size={18}
                          className={`inline mr-2 ${isFavorite ? "fill-rose-500" : ""}`}
                        />
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setSelectedConversation({
                            id: Date.now(),
                            itemId: selectedItem.id,
                            itemName: selectedItem.name,
                            otherUser: selectedItem.owner,
                          });
                          setShowMessages(true);
                        }}
                        className="bg-gray-900 cursor-pointer text-white rounded-xl py-3 font-semibold"
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
        </div>
      </div>
    </div>
  );
}
