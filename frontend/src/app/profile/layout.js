import { Suspense } from "react";
import Navbar from "@/app/components/navbar/Navbar";

export default function ProfileLayout({ children }) {
  return (
    <>
      <div className="sticky top-0 z-50 bg-gray-100 pb-4 shadow-lg">
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
      </div>
      {children}
    </>
  );
}
