import { SlidersHorizontal } from "lucide-react";

export default function ListingHeader({
  isMobile = false,
  totalItems = 0,
  onOpenFilters,
  showFilterButton = true,
}) {
  return (
    <div className="mb-2 flex items-center justify-between">
      {/* Items count */}
      <p
        className={`${
          isMobile ? "text-xs" : "text-md"
        } font-semibold text-gray-800`}
      >
        All Items ({totalItems})
      </p>

      {/* Filter Button — only when enabled (e.g. hidden when filter is in Featured section) */}
      {showFilterButton && onOpenFilters && (
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
      )}
    </div>
  );
}
