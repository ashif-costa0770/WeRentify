import AdminGuard from "./AdminGuard";
import Sidebar from "@/app/_components/admin/Sidebar";
import Header from "@/app/_components/admin/Header";

export default function ProtectedAdminLayout({ children }) {
  return (
    <AdminGuard>
      <div className="min-h-screen flex bg-gray-100">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header />
          <main className="p-6 bg-gray-100 min-h-[calc(100vh-4rem)]">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  );
}
