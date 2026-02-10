"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import CommunityFilters from "./components/CommunityFilters";
import PostsGrid from "./components/PostsGrid";
import { getPosts } from "@/services/post.service"; // 👈 backend API
import { useUser } from "@/context/UserContext";

export default function CommunityPage() {
  const { user } = useUser();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  // 🔹 Fetch posts from backend
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getPosts();
      setPosts(res.data.data); // assuming successResponse format
    } catch (error) {
      console.error("Failed to fetch posts", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // 🔹 Update a single post in state (for likes/saves)
  const handleUpdatePost = useCallback((updatedPost) => {
    setPosts((prevPosts) =>
      prevPosts.map((p) => (p._id === updatedPost._id ? updatedPost : p)),
    );
  }, []);

  // 🔹 Filter + sort (frontend only for now)
  const filteredAndSortedPosts = useMemo(() => {
    let result = [...posts];

    // 1️⃣ Filter
    if (activeFilter !== "all") {
      result = result.filter((post) => post.type === activeFilter);
    }

    // 2️⃣ Sort
    switch (sortBy) {
      case "recent":
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;

      case "oldest":
        result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;

      case "liked":
        result.sort((a, b) => b.likes - a.likes);
        break;

      case "nearest":
        result.sort((a, b) => a.distance - b.distance);
        break;

      default:
        break;
    }

    return result;
  }, [posts, activeFilter, sortBy]);

  // 🔹 Counts for filter tabs
  const counts = useMemo(
    () => ({
      all: posts.length,
      service: posts.filter((p) => p.type === "service").length,
      item: posts.filter((p) => p.type === "item").length,
    }),
    [posts],
  );

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <CommunityFilters
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          counts={counts}
          sortBy={sortBy}
          setSortBy={setSortBy}
          onPostCreated={fetchPosts}
        />

        {loading ? (
          <p className="text-center py-16 text-gray-500">Loading posts...</p>
        ) : (
          <PostsGrid
            posts={filteredAndSortedPosts}
            currentUser={user}
            onUpdatePost={handleUpdatePost}
          />
        )}
      </div>
    </main>
  );
}
