'use client';

import ListItemButton from './ListItemButton';
import ItemCategoryGrid from './ItemCategoryGrid';

export default function ItemCategoriesSection({selectedCategory, onCategorySelect, onListingCreated}) {
  return (
    <section className="max-w-7xl mx-auto px-4 mt-8">
      {/* Top row: List Item button */}
      <div className="mb-4">
        <ListItemButton onListingCreated={onListingCreated} />
      </div>

      {/* Category grid */}
      <ItemCategoryGrid 
        selectedCategory={selectedCategory}
        onCategorySelect={onCategorySelect}
      />
    </section>
  );
}
