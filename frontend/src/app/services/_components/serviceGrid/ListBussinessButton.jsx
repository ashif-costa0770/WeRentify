"use client";

import { useListBusiness } from "@/context/ListBusinessContext";
import { useUser } from "@/context/UserContext";

export default function ListBusinessButton() {
  const { openModal } = useListBusiness();
  const { isLogin, setShowSignIn, user } = useUser();
  const isHost = user?.mode === "host";

  const handleClick = () => {
    if(!isLogin){
      setShowSignIn(true);
      return;
    }
    openModal();
  }

  if (!isHost) return null;

  return (
    <div className="hidden md:flex justify-end">
      <button
        onClick={handleClick}
        className="
          flex items-center gap-2
          px-6 py-4
          cursor-pointer
          rounded-xl          
          font-bold text-sm
          text-white
          bg-linear-to-r from-[#5B4FE9] to-[#E95FC8]
          shadow-md
          hover:shadow-lg
          transition-all
          active:scale-[0.98]
        "
      >
        <span className="text-base leading-none">📦</span>
        <span>List Your Business</span>
      </button>
    </div>
  );
}
