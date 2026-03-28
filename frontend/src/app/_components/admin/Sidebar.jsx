"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/app/_components/navbar/Logo";
import { useEffect, useState } from "react";
import { getSettings } from "@/services/admin.service";
import { toast } from "sonner";
import Image from "next/image";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Users", href: "/admin/users" },
  { label: "Listings", href: "/admin/listings" },
  { label: "Services", href: "/admin/services" },
  { label: "Bookings", href: "/admin/bookings" },
  { label: "Posts", href: "/admin/posts" },
  { label: "Plans", href: "/admin/plans" },
  { label: "Help", href: "/admin/help" },
  { label: "Settings", href: "/admin/settings" },
];

export default function Sidebar() {
  const [logo, setLogo] = useState(null);
  const pathname = usePathname();
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const res = await getSettings();
      if (res.data.success) {
        setLogo(res.data.data[0].logo.url);
        }
      } catch (error) {
        console.error("Error fetching logo:", error);
        toast.error(error.response.data.message || "Failed to fetch settings");
      }
    };
    fetchLogo();
  }, []);

  return (
    <aside className="w-60 min-h-screen bg-slate-100 border-r border-slate-200">
      <div className="h-20 flex items-center  px-1 border-b border-slate-200">
        <div className="w-full max-w-[170px]">
        {logo && (
              <Link href="/admin/dashboard">
                <Image
                  src={logo}
                  alt="WeRentify logo"
                  width={300}
                  height={200}
                  className="h-10 ms-6 w-auto sm:h-8 md:h-8 lg:h-10 object-contain mix-blend-multiply cursor-pointer select-none transition-transform hover:scale-103"
                />
              </Link>
            )}
        </div>
      </div>

      <nav className="px-3 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-100 text-indigo-600"
                  : "text-slate-700 hover:bg-slate-200"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
