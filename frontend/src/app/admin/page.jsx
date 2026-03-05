"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "/backend-api").replace(
  /\/+$/,
  ""
);

export default function AdminEntryPage() {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    async function routeBySession() {
      try {
        const res = await fetch(`${API_URL}/admin/me`, {
          credentials: "include",
          cache: "no-store",
        });

        if (cancelled) return;
        router.replace(res.ok ? "/admin/dashboard" : "/admin/login");
      } catch {
        if (!cancelled) router.replace("/admin/login");
      }
    }

    routeBySession();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return null;
}
