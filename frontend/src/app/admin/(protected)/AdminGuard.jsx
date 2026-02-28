"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "/backend-api").replace(
  /\/+$/,
  ""
);

export default function AdminGuard({ children }) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const res = await fetch(`${API_URL}/admin/me`, {
          credentials: "include",
          cache: "no-store",
        });

        if (cancelled) return;

        if (res.status === 401 || !res.ok) {
          router.replace("/admin/login");
          return;
        }

        setAllowed(true);
      } catch {
        if (!cancelled) router.replace("/admin/login");
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [router]);

  if (!allowed) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-slate-500">Checking access...</p>
      </div>
    );
  }

  return <>{children}</>;
}
