"use client";

export default function CommunityFilters() {
  return (
    <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
      
      {/* Left: Filter Pills */}
      <div className="flex items-center gap-3">
        {/* Active */}
        <button
          className="px-6 py-2.5 rounded-full font-semibold text-white
                     bg-linear-to-r from-[#5B4FE9] to-[#E95FC8]
                     shadow-md"
        >
          All Posts (3)
        </button>

        {/* Inactive */}
        <button
          className="px-6 py-2.5 rounded-full font-semibold
                     bg-white text-gray-800 border border-gray-200
                     hover:shadow-sm"
        >
          Service Requests (2)
        </button>

        <button
          className="px-6 py-2.5 rounded-full font-semibold
                     bg-white text-gray-800 border border-gray-200
                     hover:shadow-sm"
        >
          Item Requests (1)
        </button>
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
          className="px-4 py-2.5 rounded-xl bg-white border border-gray-200
                     font-semibold text-gray-800 shadow-sm
                     focus:outline-none"
        >
          <option>Most Recent</option>
          <option>Oldest</option>
          <option>Most Liked</option>
        </select>
      </div>
    </div>
  );
}
