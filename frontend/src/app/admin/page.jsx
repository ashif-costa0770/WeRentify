import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AdminEntryPage() {
  const cookieStore = await cookies();
  const adminToken = cookieStore.get("adminToken");

  if (adminToken?.value) {
    redirect("/admin/dashboard");
  }

  redirect("/admin/login");
}
