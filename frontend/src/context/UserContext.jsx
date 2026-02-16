"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "@/services/auth.service";
import {
  getFavorites,
  addFavorite as addFavoriteApi,
  removeFavorite as removeFavoriteApi,
} from "@/services/favorite.service.js";

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

  // Fetch user profile on mount and whenever login state flips to true.
  useEffect(() => {
    const fetchUserAndFavorites = async () => {
      try {
        setIsAuthLoading(true);

        const res = await getMe();

        if (res.data.success) {
          setUser(res.data.data);
          setIsLogin(true);

          // 🔥 Fetch favorites after login
          const favRes = await getFavorites();
          setFavorites(favRes.data.data || []);
        }
      } catch (error) {
        if (error.response?.status !== 401) {
          console.error("Failed to fetch user:", error);
        }
        setUser(null);
        setIsLogin(false);
        setFavorites([]);
      } finally {
        setIsAuthLoading(false);
      }
    };

    fetchUserAndFavorites();
  }, [isLogin]);

  useEffect(() => {
    const refreshFavoritesAfterLogin = async () => {
      if (!isLogin) return;
      try {
        const favRes = await getFavorites();
        setFavorites(favRes.data.data || []);
      } catch (error) {
        console.error("Failed to refresh favorites after login:", error);
      }
    };

    refreshFavoritesAfterLogin();
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

  const addFavorite = async (data) => {
    try {
      await addFavoriteApi(data);

      // Re-fetch to always keep state in populated backend shape.
      const favRes = await getFavorites();
      setFavorites(favRes.data.data || []);
    } catch (error) {
      console.error("Add favorite failed:", error);
    }
  };

  const removeFavorite = async (favoriteId) => {
    try {
      await removeFavoriteApi(favoriteId);

      // Remove from state
      setFavorites((prev) => prev.filter((fav) => fav._id !== favoriteId));
    } catch (error) {
      console.error("Remove favorite failed:", error);
    }
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
        addFavorite,
        removeFavorite,
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
