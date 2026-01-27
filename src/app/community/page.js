"use client";

import { useMemo, useState } from "react";
import CommunityFilters from "./components/CommunityFilters";
import PostsGrid from "./components/PostsGrid";
import { communityPosts } from "@/data/communityData";

export default function CommunityPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");

  const filteredAndSortedPosts = useMemo(() => {
    let result = [...communityPosts];

    // 1️⃣ Filter
    if (activeFilter !== "all") {
      result = result.filter(
        (post) => post.type === activeFilter
      );
    }

    // 2️⃣ Sort
    switch (sortBy) {
      case "recent":
        result.sort(
          (a, b) => b.timestamp - a.timestamp
        );
        break;

      case "oldest":
        result.sort(
          (a, b) => a.timestamp - b.timestamp
        );
        break;

      case "liked":
        result.sort(
          (a, b) => b.likes - a.likes
        );
        break;

      case "nearest":
        result.sort(
          (a, b) => a.distance - b.distance
        );
        break;

      default:
        break;
    }

    return result;
  }, [activeFilter, sortBy]);

  const counts = useMemo(() => ({
    all: communityPosts.length,
    service: communityPosts.filter(p => p.type === "service").length,
    item: communityPosts.filter(p => p.type === "item").length,
  }), []);

  return (
    <main className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 pt-6">

        <CommunityFilters
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          counts={counts}
          sortBy={sortBy}
          setSortBy={setSortBy}
        />

        <PostsGrid posts={filteredAndSortedPosts} />

      </div>
    </main>
  );
}
