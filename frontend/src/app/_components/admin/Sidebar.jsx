"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/app/_components/navbar/Logo";

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard" },
  { label: "Users", href: "/admin/users" },
  { label: "Listings", href: "/admin/listings" },
  { label: "Services", href: "/admin/services" },
  { label: "Posts", href: "/admin/posts" },
  { label: "Plans", href: "/admin/plans" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 min-h-screen bg-slate-100 border-r border-slate-200">
      <div className="h-20 flex items-center  px-1 border-b border-slate-200">
        <div className="w-full max-w-[170px]">
          <Logo
            href="/admin/dashboard"
            className="h-8 w-full sm:h-8 md:h-8 lg:h-8 drop-shadow-none hover:scale-100"
          />
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
