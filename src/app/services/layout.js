import { User } from "lucide-react";
import { UserProvider } from "@/context/UserContext";
import { ListBusinessProvider } from "@/context/ListBusinessContext";

export default function ServicesLayout({ children }) {
  return (
    <>
      <UserProvider>
        <ListBusinessProvider>
            {children}
        </ListBusinessProvider>      
        </UserProvider>
    </>
  );
}
