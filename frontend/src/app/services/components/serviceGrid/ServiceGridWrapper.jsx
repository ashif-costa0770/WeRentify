"use client";

import ListBusinessButton from "./ListBussinessButton";
import { categories  } from '@/data/servicesData';
import  ServiceCategoryCard  from "./ServiceCategoryCard";



export default function ServicesCategoriesSection({selectedCategory, onSelectCategory,}) {

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      {/* Header */}
      <div className="mb-4">
        
        <ListBusinessButton />
      </div>

      {/* Categories Grid */}
      <div className="hidden md:grid grid-cols-12 gap-2">
        {categories.map((cat) => (
          <ServiceCategoryCard
            key={cat.id}
            name={cat.name}
            icon={cat.icon}
            active={selectedCategory === cat.id}
            onClick={() => onSelectCategory(cat.id)}
          />
        ))}
      </div>
    </section>
  );
}

