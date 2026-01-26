
import NavbarWrapper from "@/components/layout/NavbarWrapper";
import Footer from "@/components/footer/Footer";

export default function ListingsLayout({ children }) {
  return (
    <>
      <NavbarWrapper/>
      
      {children}

      <Footer />
    </>
  );
}
