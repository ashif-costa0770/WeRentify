"use client";

import ServiceCard from "./ServiceCard";

export default function ServiceHorizontalScroll({ 
  
    services,
   onServiceClick = () => {}, // ✅ safe default

}) {
  return (
    <div className="flex gap-6 overflow-x-auto scrollbar-hide pb-3">
      {services.map((service) => (
        <div key={service.id} className="flex-shrink-0 w-[320px]">
          <ServiceCard service={service} onClick={() => onServiceClick(service)} />
        </div>
      ))}
    </div>
  );
}