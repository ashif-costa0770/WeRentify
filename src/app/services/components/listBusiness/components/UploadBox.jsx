"use client";

import { X } from "lucide-react";

export default function UploadBox({ label, filled, onAdd, onRemove }) {
  return (
    <div
      onClick={!filled ? onAdd : undefined}
      className={`
        relative flex flex-col items-center justify-center
        h-32 rounded-xl border-2 border-dashed
        ${filled ? "border-transparent bg-gray-50" : "border-gray-300"}
        cursor-pointer hover:border-orange-400 transition
      `}
    >
      {filled ? (
        <>
          <div className="text-sm font-medium text-gray-700">{label}</div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            className="absolute top-2 right-2 rounded-full bg-red-500 p-1 text-white hover:scale-105"
          >
            <X size={12} />
          </button>
        </>
      ) : (
        <>
          <div className="text-2xl mb-1">📷</div>
          <p className="text-sm text-gray-500">Add {label}</p>
        </>
      )}
    </div>
  );
}
