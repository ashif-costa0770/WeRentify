import { Heart, Star } from "lucide-react";
import { useUser } from "@/context/UserContext";
import Image from "next/image";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

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
      className="relative bg-white rounded-2xl overflow-hidden hover:shadow-lg
                 transition-all duration-300 cursor-pointer border border-gray-200 group w-full"
    >
      {/* Image & top actions (styled like service card) */}
      <div className="aspect-[4/3] relative overflow-hidden">
        {item.photos && item.photos.length > 0 && item.photos[0]?.url ? (
          <Image
            src={item.photos[0].url}
            alt={item.itemName || item.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.itemName || item.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-2xl bg-gray-100">
            {item.image}
          </div>
        )}

        {/* Favorite button (match pill style) */}
        <button
          type="button"
          onClick={handleFavoriteClick}
          className="absolute cursor-pointer right-3 top-2 flex items-center justify-center w-7 h-7 bg-white/95 backdrop-blur-sm rounded-full hover:bg-white hover:scale-110 transition-all duration-200 shadow-lg"
        >
          <Heart
            size={16}
            className={
              isFavorite ? "fill-rose-500 text-rose-500" : "text-gray-700"
            }
          />
        </button>

        {/* Featured badge (match service badge) */}
        {item.isFeatured && (
          <Badge
            className="absolute left-2 top-2 flex items-center gap-1
                       border border-amber-200
                       px-1.5 py-0.5 text-[10px] font-semibold text-amber-700
                       shadow-sm backdrop-blur bg-amber-50/95 rounded-full"
          >
            <span className="text-amber-700">FEATURED</span>
          </Badge>
        )}
      </div>

      {/* Content (aligned with service card styling) */}
      <div className="px-3 py-2">
        <div className="flex items-center justify-between gap-1">
          <h3 className="text-md font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">
            {item.itemName || item.name}
          </h3>
          {item.rating > 0 && (
            <div className="flex items-center gap-1">
              <Star size={16} className="fill-yellow-400 text-yellow-400" />
              <span className="text-sm font-semibold text-gray-900">
                {item.rating}
              </span>
              {item.reviewCount > 0 && (
                <span className="text-sm text-gray-500">
                  ({item.reviewCount})
                </span>
              )}
            </div>
          )}
        </div>

        <p className="mt-2 text-base font-semibold text-gray-900">
          ${item.hourlyRate || "0"}
          <span className="text-sm font-normal text-gray-500">
            {" "}
            / hour
          </span>
         
        </p>

        <div className="mt-2 flex items-center gap-1.5">
          <span className="text-xs font-medium text-gray-600">
            {item.pickupLocation}
          </span>

          {item.verified && (
            <span className="ml-auto flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded-full">
              ✔ Verified
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
