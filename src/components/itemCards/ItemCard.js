import { Heart, CheckCircle, Star } from "lucide-react";

export default function ItemCard({
  item,
  favorites = [],
  toggleFavorite = () => {},
  onSelect = () => {},
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onSelect(item)}   // ✅ FIXED
      onKeyDown={(e) => {
        if (e.key === "Enter") onSelect(item);
      }}
      className="bg-white rounded-lg overflow-hidden hover:shadow-2xl
                 transition-all cursor-pointer border border-gray-100 group"
    >
      {/* Image */}
      <div className="relative">
        <div className="aspect-square bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-hidden">
          {item.imageUrl ? (
            <img
              src={item.imageUrl}
              alt={item.name}
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
          onClick={(e) => {
            e.stopPropagation(); // ⛔ prevents modal open
            toggleFavorite(item.id);
          }}
          className="absolute cursor-pointer top-1.5 right-1.5 bg-white/95
                     rounded-full p-1.5 shadow-lg hover:scale-105 transition"
        >
          <Heart
            size={16}
            className={
              favorites.includes(item.id)
                ? "fill-rose-500 text-rose-500"
                : "text-gray-600"
            }
          />
        </button>

        {/* Verified badge */}
        {item.verified && (
          <div
            className="absolute top-1.5 left-1.5
                       bg-gradient-to-r from-emerald-500 to-teal-500
                       text-white px-2 py-1 rounded text-[10px]
                       font-bold flex items-center gap-1"
          >
            <CheckCircle size={12} /> Verified
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-2">
        <div className="flex items-start justify-between mb-0.5">
          <h3 className="font-bold text-[14px] text-gray-900 line-clamp-1">
            {item.name}
          </h3>

          <div className="flex items-center gap-1">
            <Star size={12} className="fill-yellow-400 text-yellow-400" />
            <span className="text-[12px] font-bold text-gray-700">
              {item.rating}
            </span>
          </div>
        </div>

        <p className="text-[12px] text-gray-500 mb-1">
          {item.distance} mi away
        </p>

        <div className="space-y-0.5">
          <div className="flex items-baseline gap-1">
            <span className="text-[18px] font-bold text-gray-900">
              ${item.hourlyRate}
            </span>
            <span className="text-[13px] text-gray-500">/hr</span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-gray-600">
            <span>${item.dailyRate}/day</span>
            <span className="text-gray-400">•</span>
            <span>
              ${(item.dailyRate * 7 * 0.85).toFixed(0)}/wk
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
