'use client';

export default function ListItemButton() {
  return (
    <div className="hidden md:flex justify-end">
      <button
        className="
          flex items-center gap-2
          px-6 py-4
          cursor-pointer
          rounded-xl
          mt-[-10px]
          font-bold text-sm
          text-white
          bg-linear-to-r from-[#5B4FE9] to-[#E95FC8]
          shadow-md
          hover:shadow-lg
          transition-all
          active:scale-[0.98]
        "
      >
        <span className="text-base leading-none">📦</span>
        <span>List Item</span>
      </button>
    </div>
  );
}
