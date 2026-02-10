"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { services } from "@/data/servicesData";
import { items as listingItems } from "@/data/listingsData";
import { getMe } from "@/services/auth.service";

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [isLogin, setIsLogin] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Fetch user profile on mount or when isLogin changes
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsAuthLoading(true);
        const res = await getMe();
        if (res.data.success) {
          setUser(res.data.data);
          setIsLogin(true);
        }
      } catch (error) {
        // Silently handle 401 or network errors on initial load
        if (error.response?.status !== 401) {
          console.error("Failed to fetch user profile:", error);
        }
        setUser(null);
        setIsLogin(false);
      } finally {
        setIsAuthLoading(false);
      }
    };

    fetchUser();
  }, [isLogin]);

  // Load favorites from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedFavorites = localStorage.getItem("favorites");
      if (savedFavorites) {
        try {
          const parsed = JSON.parse(savedFavorites);

          // Normalize legacy formats:
          // - array of ids (number/string)
          // - array of objects without `type`
          // Try to map ids/objects to full objects and infer type.
          const normalized = Array.isArray(parsed)
            ? parsed
                .map((entry) => {
                  // primitive id (legacy from earlier implementations)
                  if (entry === null || entry === undefined) return null;

                  if (typeof entry === "number" || typeof entry === "string") {
                    const id = entry;
                    const foundItem = listingItems.find(
                      (i) => String(i.id) === String(id),
                    );
                    if (foundItem) return { ...foundItem, type: "item" };
                    const foundService = services.find(
                      (s) => String(s.id) === String(id),
                    );
                    if (foundService)
                      return { ...foundService, type: "service" };
                    return null;
                  }

                  // object entry
                  if (typeof entry === "object") {
                    if (entry.type) return entry; // already migrated

                    // try to infer by matching id in listings or services
                    if (entry.id !== undefined && entry.id !== null) {
                      const foundItem = listingItems.find(
                        (i) => String(i.id) === String(entry.id),
                      );
                      if (foundItem) return { ...foundItem, type: "item" };
                      const foundService = services.find(
                        (s) => String(s.id) === String(entry.id),
                      );
                      if (foundService)
                        return { ...foundService, type: "service" };
                    }

                    // fallback inference: if it has dailyRate -> item, else service
                    if (entry.dailyRate !== undefined)
                      return { ...entry, type: "item" };
                    return { ...entry, type: "service" };
                  }

                  return null;
                })
                .filter(Boolean)
            : [];

          setFavorites(normalized);
        } catch (error) {
          console.error("Failed to load favorites:", error);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem("favorites", JSON.stringify(favorites));
    }
  }, [favorites, isLoaded]);

  const toggleFavorite = (item, type = "service") => {
    setFavorites((prev) => {
      // Use _id for backend items, fallback to id for static data
      const itemId = item._id || item.id;

      // Check if item exists in favorites array by ID and type
      const exists = prev.some(
        (fav) => (fav._id || fav.id) === itemId && fav.type === type,
      );

      if (exists) {
        // Remove if exists
        return prev.filter(
          (fav) => !((fav._id || fav.id) === itemId && fav.type === type),
        );
      } else {
        // Add full item object with type
        return [...prev, { ...item, type }];
      }
    });
  };

  return (
    <UserContext.Provider
      value={{
        isLogin,
        setIsLogin,
        user,
        setUser,
        isAuthLoading,
        favorites,
        setFavorites,
        toggleFavorite,
        showSignUp,
        setShowSignUp,
        showSignIn,
        setShowSignIn,
        showMessages,
        setShowMessages,
        selectedConversation,
        setSelectedConversation,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export const useUser = () => useContext(UserContext);
