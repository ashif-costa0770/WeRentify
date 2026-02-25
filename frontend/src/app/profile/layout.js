import { Suspense } from "react";
import Navbar from "@/components/navbar/Navbar";
import { ListBusinessProvider } from "@/context/ListBusinessContext";

export default function ProfileLayout({ children }) {
  return (
    <ListBusinessProvider>
      <div className="sticky top-0 z-50 bg-gray-100 pb-4 shadow-lg">
        <Suspense fallback={null}>
          <Navbar />
        </Suspense>
      </div>
      {children}
    </ListBusinessProvider>
  );
}
