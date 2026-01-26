import HeroSearch from "./HeroSearch";
import Navbar from "./Navbar";

export default function NavbarWrapper() {
  return (
    <div className="sticky top-0 z-50 bg-gray-100 pb-4 shadow-lg">
      <Navbar/>
      <HeroSearch/>
    </div>
  );
}
