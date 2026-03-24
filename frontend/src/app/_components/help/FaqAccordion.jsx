"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export default function FaqAccordion({ items = [], allowMultiple = false }) {
  const [openIndexes, setOpenIndexes] = useState([]);

  const toggleIndex = (index) => {
    setOpenIndexes((prev) => {
      const isOpen = prev.includes(index);
      if (allowMultiple) {
        return isOpen ? prev.filter((item) => item !== index) : [...prev, index];
      }
      return isOpen ? [] : [index];
    });
  };

  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {items.map((item, index) => {
        const isOpen = openIndexes.includes(index);
        const panelId = `faq-panel-${index}`;
        const buttonId = `faq-button-${index}`;

        return (
          <article key={item?._id || `${item?.question}-${index}`} className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <h3>
              <button
                id={buttonId}
                type="button"
                className="flex w-full cursor-pointer items-center justify-between gap-3 px-4 py-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggleIndex(index)}
              >
                <span className="text-sm font-semibold text-gray-900 sm:text-base">{item?.question || "Untitled question"}</span>
                <ChevronDown
                  size={18}
                  className={`shrink-0 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={`grid transition-all duration-300 ease-in-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <div className="border-t border-gray-100 px-4 py-4 text-sm leading-6 text-gray-700">
                  {item?.answer || "Answer not available."}
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
