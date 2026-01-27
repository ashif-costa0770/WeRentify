import Footer from "@/components/footer/Footer";
import Navbar from "@/components/navbar/Navbar";

export default function CommunityLayout({ children }) {
  return (
    <>
      <main className="relative">
        <div className="sticky top-0 z-50 bg-gray-100 pb-4 shadow-lg">
          <Navbar />
        </div>

        {children}
      </main>
    </>
  );
}
