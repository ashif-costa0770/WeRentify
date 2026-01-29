"use client";

import { useState } from "react";
import PostCard from "./PostCards";
import CommentModal from "./CommentModal";

export default function PostsGrid({ posts }) {
  // State management for post interactions
  const [likedPosts, setLikedPosts] = useState([]);
  const [savedPosts, setSavedPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(true); // Set to false if you want to test login flow
  const [showLogin, setShowLogin] = useState(false);
  const [messagePost, setMessagePost] = useState(null);
  const [showPostMessage, setShowPostMessage] = useState(false);

  if (!posts?.length) {
    return (
      <p className="text-center text-gray-500 py-16">
        No posts found
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8">
        {posts.map((post) => (
          <PostCard 
            key={post.id} 
            post={post}
            likedPosts={likedPosts}
            setLikedPosts={setLikedPosts}
            savedPosts={savedPosts}
            setSavedPosts={setSavedPosts}
            setSelectedPost={setSelectedPost}
            isLoggedIn={isLoggedIn}
            setShowLogin={setShowLogin}
            setMessagePost={setMessagePost}
            setShowPostMessage={setShowPostMessage}
          />
        ))}
      </div>

      {/* Comment Modal */}
      <CommentModal
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        isLoggedIn={isLoggedIn}
        setShowLogin={setShowLogin}
      />
    </>
  );
}