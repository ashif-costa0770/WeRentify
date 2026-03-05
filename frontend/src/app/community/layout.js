import { Suspense } from "react";
import Navbar from "@/app/_components/navbar/Navbar";

export default function CommunityLayout({ children }) {
  return (
    <main className="relative">
      <div className="sticky top-0 z-50 bg-gray-100 pb-4 shadow-lg">
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
      </div>
      {children}
    </main>
  );
}
