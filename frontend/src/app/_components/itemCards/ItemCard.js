import { Heart, CheckCircle, Star } from "lucide-react";
import { useUser } from "@/context/UserContext";
import Image from "next/image";
import { toast } from "sonner";

export default function ItemCard({ item, onSelect = () => {} }) {
  const { favorites, addFavorite, removeFavorite, isLogin, setShowSignIn } =
    useUser();

  const itemId = item._id || item.id;

  const existingFavorite = favorites.find(
    (fav) => {
      const favoriteProductId =
        typeof fav.productId === "string"
          ? fav.productId
          : fav.productId?._id || fav.productId?.id;

      return (
        String(favoriteProductId) === String(itemId) &&
        fav.productType === "Listing"
      );
    },
  );

  const isFavorite = !!existingFavorite;

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();

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
          productId: itemId,
          productType: "Listing",
        });
        toast.success("Added to favorites");
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || "Favorite action failed");
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(item)}
      onKeyDown={(e) => {
        if (e.key === "Enter") onSelect(item);
      }}
      className="relative bg-white rounded-lg overflow-hidden hover:shadow-2xl
                 transition-all cursor-pointer border border-gray-100 group"
    >
      {/* Image */}
      <div className="relative">
        <div className="aspect-square bg-linear-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-hidden">
          {item.photos && item.photos.length > 0 && item.photos[0]?.url ? (
            <Image
              src={item.photos[0].url}
              alt={item.itemName || item.name}
              width={200}
              height={200}
              className="w-full h-full object-cover
                         group-hover:scale-110 transition-transform duration-300"
            />
          ) : item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              width={200}
              height={200}
              className="w-full h-full object-cover
                         group-hover:scale-110 transition-transform duration-300"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-2xl">
              {item.image}
            </div>
          )}
        </div>

        {/* Favorite button */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          className="absolute cursor-pointer top-1.5 right-1.5 bg-white/95
                     rounded-full p-1.5 shadow-lg hover:scale-105 transition"
        >
          <Heart
            size={16}
            className={
              isFavorite ? "fill-rose-500 text-rose-500" : "text-gray-600"
            }
          />
        </button>

        {/* Featured badge (stays on image) */}
        {item.isFeatured && (
          <div
            className="absolute top-2 left-2 flex items-center gap-1
                       bg-white/90 backdrop-blur
                       text-amber-600
                       px-2 py-0.5 rounded-full
                       text-[11px] font-semibold
                       shadow-sm border border-amber-200"
          >
            <Star size={12} className="fill-amber-600" /> Featured
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2">
        <div className="flex items-start justify-between mb-0.5">
          <h3 className="font-bold text-[14px] text-gray-900 line-clamp-1">
            {item.itemName || item.name}
          </h3>

          <div className="flex items-center gap-1">
            {item.rating > 0 && (
              <>
                <span className="text-gray-600"></span>
            <Star size={12} className="fill-yellow-400 text-yellow-400" />
              <span className="text-[12px] font-bold text-gray-700">
                  {item.rating } {item.reviewCount > 0 && `(${item.reviewCount})`}
                </span>
              </>
            )}
          </div>
        </div>

        <p className="text-[12px] text-gray-500 mb-1">
          {item.distance || "0"} mi away
        </p>

        <div className="space-y-0.5">
          <div className="flex items-baseline gap-1">
            <span className="text-[18px] font-bold text-gray-900">
              ${item.hourlyRate || "0"}
            </span>
            <span className="text-[13px] text-gray-500">/hr</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-gray-600">
            <span>${item.dailyRate || "0"}/day</span>
            <span className="text-gray-400">•</span>
            <span>${((item.dailyRate || 0) * 7 * 0.85).toFixed(0)}/wk</span>
          </div>
        </div>
      </div>

      {/* Verified badge: card bottom-right (like service card) */}
        {item.verified && (
        <div
          className="absolute bottom-2 right-2 flex items-center gap-1
                      text-green-500 px-2 py-1 rounded-full
                      text-[11px] font-bold "
        >
          <CheckCircle size={12}  /> Verified
        </div>
      )}
    </div>
  );
}
