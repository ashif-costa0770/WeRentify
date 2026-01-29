"use client";
import { categories } from "@/data/listingsData.js";

export default function ItemCategoryGrid({
  selectedCategory,
  onCategorySelect,
}) {
  return (
    <section className="max-w-7xl mx-auto">
      <div className="hidden md:grid grid-cols-12 gap-2">
        {categories.map(({ id, name, icon: Icon }) => {
          const isActive = selectedCategory === id;

          return (
            <button
              key={id}
              onClick={() => onCategorySelect(id)}
              className={`h-23 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all
                ${
                  isActive
                    ? "bg-linear-to-r from-[#5B4FE9] to-[#E95FC8] text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-purple-400"
                }`}
            >
              <span className="text-2xl leading-none">
                <Icon />
              </span>

              <span className="text-[10px] font-bold text-center leading-tight whitespace-pre-line">
                {name}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
