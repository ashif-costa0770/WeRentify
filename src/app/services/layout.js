import { User } from "lucide-react";
import { ListBusinessProvider } from "@/context/ListBusinessContext";

export default function ServicesLayout({ children }) {
  return (
    <>
      <ListBusinessProvider>{children}</ListBusinessProvider>
    </>
  );
}
