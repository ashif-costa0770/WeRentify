"use client";

export default function CommunityFilters({
  activeFilter,
  setActiveFilter,
  counts,
  sortBy,
  setSortBy,
}) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4 mb-6 mt-8">

      {/* Left: Filter Pills */}
      <div className="flex items-center gap-3">
        {[
          { key: "all", label: `All Posts (${counts.all})` },
          { key: "service", label: `Service Requests (${counts.service})` },
          { key: "item", label: `Item Requests (${counts.item})` },
        ].map((filter) => {
          const isActive = activeFilter === filter.key;

          return (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key)}
              className={`px-6 py-2.5 rounded-full font-semibold transition-all
                ${
                  isActive
                    ? "text-white bg-linear-to-r from-[#5B4FE9] to-[#E95FC8] shadow-md"
                    : "bg-white text-gray-800 border border-gray-200 hover:shadow-sm"
                }
              `}
            >
              {filter.label}
            </button>
          );
        })}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        <button
          className="px-6 py-3 rounded-xl font-bold text-white
                     bg-linear-to-r from-[#5B4FE9] to-[#E95FC8]
                     shadow-md hover:shadow-lg transition-all"
        >
          ✍️ Create Post
        </button>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5  rounded-xl bg-white border border-gray-200
                     font-semibold text-gray-800 shadow-sm
                     focus:outline-none"
        >
          <option value="recent">Most Recent</option>
          <option value="oldest">Oldest</option>
          <option value="liked">Most Liked</option>
          <option value="nearest">Nearest First</option>
        </select>
      </div>
    </div>
  );
}
