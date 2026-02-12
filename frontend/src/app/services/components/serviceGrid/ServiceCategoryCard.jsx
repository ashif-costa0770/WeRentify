"use client";
import Image from "next/image";

export default function ServiceCategoryCard({ icon, name, active, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`h-24 cursor-pointer rounded-xl border flex flex-col items-center justify-center gap-2 px-2 transition-all
        ${
          active
            ? "bg-gradient-to-r from-[#5B4FE9] to-[#E95FC8] text-white shadow-md border-transparent"
            : "bg-white text-gray-700 border-gray-200 hover:border-purple-400 hover:bg-gray-50"
        }`}
    >
      {/* Icon */}
      <div className="relative w-10 h-10 flex items-center justify-center">
        {icon?.url ? (
          <Image src={icon.url} alt={name} fill className="object-contain" />
        ) : (
          <div className="w-10 h-10 bg-gray-200 rounded-md" />
        )}
      </div>

      {/* Label */}
      <p className="text-[11px] font-semibold text-center leading-tight">
        {name}
      </p>
    </div>
  );
}
