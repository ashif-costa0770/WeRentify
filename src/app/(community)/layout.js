import Footer from "@/components/footer/Footer";
import Navbar from "@/components/navbar/Navbar";


export default function CommunityLayout({ children }) {
  return (
    <>
      
      <div className="relative">
        <Navbar />   
       {children}

      </div>
      <Footer/>
        
    </>
  );
}
