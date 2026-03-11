"use client";

import ServiceHorizontalScroll from "./ServiceHorizontal";

export default function ServiceCategoryBlock({
  categoryLabel,
  services,
  onServiceClick,
}) {
  return (
    <section className="mb-14">
      {/* Category title (hidden for Featured, since it already has its own heading) */}
      {categoryLabel !== "Featured" && (
        <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
          {categoryLabel}
          <span className="text-gray-400">→</span>
        </h2>
      )}

      <ServiceHorizontalScroll services={services}  onServiceClick={onServiceClick} />
    </section>
  );
}
