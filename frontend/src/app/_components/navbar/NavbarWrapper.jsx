"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";

const Navbar = dynamic(() => import("./Navbar"), {
  loading: () => <div className="h-[76px]" />,
});

export default function NavbarWrapper() {
  const pathname = usePathname();
  if (pathname?.startsWith("/admin")) return null;

  return (
    <div className="sticky top-0 z-10 bg-gray-100 shadow-lg">
      <Navbar />
    </div>
  );
}
