import "./globals.css";
import Footer from "@/components/footer/Footer";
import { UserProvider } from "@/context/UserContext";


export const metadata = {
  title: "WeRentify",
  description: "Borrow what you need. Lend what you don't.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <UserProvider>
          <main>{children}</main>
          <Footer />
        </UserProvider>
      </body>
    </html>
  );
}
