// Root admin layout: no auth here so /admin/login can render
export default function AdminLayout({ children }) {
  return <>{children}</>;
}
