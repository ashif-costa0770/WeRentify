"use client";
// import { categories } from "@/data/listingsData.js";
import { useEffect, useState } from "react";
import { getAllCategory } from "@/services/category.service.js";
import Image from "next/image";

export default function ItemCategoryGrid({
  selectedCategory,
  onCategorySelect,
}) {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState(null);

  // ✅ Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await getAllCategory("item");
        // Adjust depending on your backend response structure
        setCategories(res.data?.data || res.data || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategoryError("Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="max-w-7xl mx-auto">
      <div className="hidden md:grid grid-cols-12 gap-2">
        <button
          onClick={() => onCategorySelect("all")}
          className={`h-23 rounded-xl border-2 cursor-pointer flex flex-col items-center justify-center gap-2 transition-all
            ${
              selectedCategory === "all"
                ? "bg-linear-to-r from-[#5B4FE9] to-[#E95FC8] text-white shadow-lg"
                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-purple-400"
            }`}
        >
          <div className="relative w-8 h-8 flex items-center justify-center">
            <Image
                    src="https://res.cloudinary.com/drz08orln/image/upload/v1770956705/category-icons/gblxftbngf3csxyu1gjt.svg"
                    alt="All Items"
                    fill
                    className="object-contain"
                  />
          </div>
          <p className="text-[10px] font-semibold text-center leading-tight">
            All Item
          </p>
        </button>

        {categories.map((cat) => {
          const isActive = selectedCategory === cat._id;

          return (
            <button
              key={cat._id}
              onClick={() => onCategorySelect(cat._id)}
              className={`h-22 rounded-xl border-2 cursor-pointer flex flex-col items-center justify-center gap-2 px-2 transition-all
                ${
                  isActive
                    ? "bg-linear-to-r from-[#5B4FE9] to-[#E95FC8] text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-purple-400"
                }`}
            >
              {/* Icon */}
              <div className="relative w-8 h-8 flex items-center justify-center">
                {cat?.icon?.url ? (
                  <Image
                    src={cat.icon.url}
                    alt={cat.name}
                    fill
                    className="object-contain"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gray-200 rounded-md" />
                )}
              </div>

              {/* Label */}
              <p className="text-[10px] font-semibold text-center leading-tight">
                {cat.name}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}
