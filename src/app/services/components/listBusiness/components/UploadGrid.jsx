"use client";

import UploadBox from "./UploadBox";

export default function UploadGrid({
  count,
  items,
  label,
  onAdd,
  onRemove,
}) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <UploadBox
          key={index}
          label={label}
          filled={!!items[index]}
          onAdd={() => onAdd(index)}
          onRemove={() => onRemove(index)}
        />
      ))}
    </div>
  );
}
