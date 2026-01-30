"use client";

export default function GlobalServicesHeader({
  totalCount,
  sortBy,
  onSortChange,
}) {
  return (
    <div className="mb-1 flex items-center justify-between">
      <p className="text-sm font-medium text-gray-700">
        {totalCount} services available
      </p>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-800">Sort by:</span>

        <select
          value={sortBy}
          onChange={(e) => onSortChange(e.target.value)}
          className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
        >
          <option value="recommended">Recommended</option>
          <option value="highest_rated">Highest Rated</option>
          <option value="price_low_high">Price: Low to High</option>
          <option value="price_high_low">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
}
