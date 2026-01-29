"use client";

import { createContext, useContext, useState } from "react";

const UserContext = createContext(null);

export function UserProvider({ children }) {
//   const [user, setUser] = useState(null); // null = not logged in
  const [favorites, setFavorites] = useState([]);

  const toggleFavorite = (serviceId) => {
    setFavorites((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  return (
    <UserContext.Provider
      value={{
        // user,
        // setUser,
        favorites,
        toggleFavorite,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
