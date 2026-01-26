import { SlidersHorizontal } from "lucide-react";

export default function ListingHeader({
  isMobile = false,
  totalItems = 0,
  onOpenFilters,
}) {
  return (
    <div className="mb-2 flex items-center justify-between">
      {/* Items count */}
      <p
        className={`${
          isMobile ? "text-xs" : "text-sm"
        } font-semibold text-gray-700`}
      >
        <span
          className={`${
            isMobile ? "text-xl" : "text-2xl"
          } font-bold bg-linear-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}
        >
          {totalItems}
        </span>{" "}
        items available
      </p>

      {/* Filter Button */}
      <button
        type="button"
        onClick={onOpenFilters}
        className={`flex cursor-pointer items-center gap-2 text-gray-800 ${
          isMobile ? "px-2 py-1 text-xs" : "px-3 py-2 text-xs"
        } rounded-full border-2 border-gray-300 bg-white font-bold shadow-md hover:bg-gray-50`}
      >
        <SlidersHorizontal size={isMobile ? 12 : 14} />
        Filters
      </button>
    </div>
  );
}
