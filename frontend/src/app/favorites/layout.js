import { Suspense } from "react";
import Navbar from "@/app/components/navbar/Navbar";

function FavoriteLayout({ children }) {
  return (
    <>
      <main className="relative">
        <div className="sticky top-0 z-50 bg-gray-100 pb-4 shadow-lg">
          <Suspense fallback={null}>
            <Navbar />
          </Suspense>
        </div>
        {children}
      </main>
    </>
  );
}

export default FavoriteLayout;
