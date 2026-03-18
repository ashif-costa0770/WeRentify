"use client";

import dynamic from "next/dynamic";

const Navbar = dynamic(() => import("./Navbar"), {
  loading: () => <div className="h-[76px]" />,
});

export default function NavbarWrapper() {
  return (
    <div className="sticky top-0 z-10 bg-gray-100 shadow-lg">
      <Navbar />
    </div>
  );
}
