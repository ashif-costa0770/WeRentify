// app/services/components/ServiceCategoryCard.js
"use client";

export default function ServiceCategoryCard({  icon, name, active, onClick,}) {
  return (
    <div
     onClick={onClick}
      className={` h-23 cursor-pointer rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all
        ${
          active
            ? "bg-linear-to-r from-[#5B4FE9] to-[#E95FC8] text-white shadow-lg"
            : "bg-white text-gray-700 hover:bg-gray-50 border-gray-200 hover:border-purple-400"
        }`}
    >
      {/* Icon */}
      <div className="text-2xl leading-none">{icon}</div>

      {/* Label */}
      <p
        className={`text-[10px] font-bold text-center leading-tight whitespace-pre-line`}
      >
        {name}
      </p>
    </div>
  );
}
