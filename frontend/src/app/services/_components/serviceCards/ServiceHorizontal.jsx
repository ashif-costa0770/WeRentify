"use client";

import ServiceCard from "./ServiceCard";

export default function ServiceHorizontalScroll({ 
  
    services,
   onServiceClick = () => {}, // ✅ safe default

}) {
  return (
    <div className="flex gap-6 overflow-x-auto scrollbar-hide">
      {services.map((service) => (
        <div key={service.id} className="flex-shrink-0 w-[294px]">
          <ServiceCard service={service} onClick={() => onServiceClick(service)} />
        </div>
      ))}
    </div>
  );
}