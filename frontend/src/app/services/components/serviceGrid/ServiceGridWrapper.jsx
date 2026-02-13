"use client";

import ListBusinessButton from "./ListBussinessButton";
// import { categories  } from '@/data/servicesData';
import ServiceCategoryCard from "./ServiceCategoryCard";
import { useEffect, useState } from "react";
import { useListBusiness } from "@/context/ListBusinessContext";
import { getAllCategory } from "@/services/category.service"; // ✅ adjust path if needed

export default function ServicesCategoriesSection({
  selectedCategory,
  onSelectCategory,
}) {
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoryError, setCategoryError] = useState(null);

  // ✅ Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const res = await getAllCategory("service");

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
    <section className="mx-auto max-w-7xl px-4 py-10">
      {/* Header */}
      <div className="mb-4">
        <ListBusinessButton />
      </div>

      {/* Categories Grid */}
      <div className="hidden md:grid grid-cols-12 gap-2">
        {/* 🔥 Add ALL SERVICES manually */}
        <ServiceCategoryCard
          name="ALL SERVICES"
          icon={{ url: "https://res.cloudinary.com/drz08orln/image/upload/v1770956705/category-icons/gblxftbngf3csxyu1gjt.svg" }}
          active={selectedCategory === "all"}
          onClick={() => onSelectCategory("all")}
        />

        {/* Backend categories */}
        {categories.map((cat) => (
          <ServiceCategoryCard
            key={cat._id}
            name={cat.name}
            icon={cat.icon}
            active={selectedCategory === cat._id}
            onClick={() => onSelectCategory(cat._id)}
          />
        ))}
      </div>
    </section>
  );
}
