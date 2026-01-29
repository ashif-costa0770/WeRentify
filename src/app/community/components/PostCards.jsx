"use client";

import { Heart, MessageCircle, Share, Bookmark } from "lucide-react";
import { timeAgo } from "@/utils/timeAgo";

export default function PostCard({ 
  post, 
  likedPosts = [], 
  setLikedPosts = () => {}, 
  savedPosts = [], 
  setSavedPosts = () => {}, 
  setSelectedPost = () => {},
  isLoggedIn = false,
  setShowLogin = () => {},
  setMessagePost = () => {},
  setShowPostMessage = () => {}
}) {
  const isService = post.type === "service";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all py-2 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-linear-to-r from-indigo-500 to-pink-500 text-white flex items-center justify-center font-bold">
            {post.author.charAt(0)}
          </div>

          <div>
            <p className="font-semibold text-sm text-gray-900">{post.author}</p>
            <p className="text-xs text-gray-500">{timeAgo(post.timestamp)}</p>
          </div>
        </div>

        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold ${
            isService
              ? "bg-orange-100 text-orange-600"
              : "bg-purple-100 text-purple-600"
          }`}
        >
          {isService ? "🔧 Service" : "📦 Item"}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-bold text-gray-900 mb-1">{post.title}</h3>

      {/* Description */}
      <p className="text-[13px] text-gray-600 mb-4 line-clamp-3">
        {post.description}
      </p>

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] mb-4">
        <span className="flex items-center text-gray-500 gap-1 bg-gray-100 px-2 py-1 rounded-full">
          📍 {post.location}
        </span>

        <span className="flex items-center  text-gray-500 gap-1 bg-gray-100 px-2 py-1 rounded-full">
          📅 {post.dateNeeded}
        </span>

        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
          💰 {post.budget}
        </span>

        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
          📍 {post.distance} mi
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-gray-600">

          <button
            onClick={() => {
              if (likedPosts.includes(post.id)) {
                setLikedPosts(likedPosts.filter(id => id !== post.id));
              } else {
                setLikedPosts([...likedPosts, post.id]);
              }
            }}
            className="flex cursor-pointer items-center gap-1 hover:text-red-500 hover:scale-110 transition-transform">
            <Heart 
              size={18} 
              className={likedPosts.includes(post.id) ? 'fill-rose-500 text-rose-500' : ''}
            />
            <span className="text-sm">{post.likes + (likedPosts.includes(post.id) ? 1 : 0)}</span>
          </button>

          <button 
            onClick={(e) => {
              e.stopPropagation();
              setSelectedPost(post);
            }}
            className="flex cursor-pointer items-center gap-1 hover:text-indigo-500 hover:scale-110 transition-transform"
          >
            <MessageCircle size={18} />
            <span className="text-sm">{post.comments}</span>
          </button>

          <button 
            onClick={() => {
              if (savedPosts.includes(post.id)) {
                setSavedPosts(savedPosts.filter(id => id !== post.id));
              } else {
                setSavedPosts([...savedPosts, post.id]);
              }
            }}
            className="flex cursor-pointer items-center gap-1 hover:text-gray-900 hover:scale-110 transition-transform"
          >
            <Bookmark 
              size={18} 
              className={savedPosts.includes(post.id) ? 'fill-indigo-500 text-indigo-500' : ''}
            />
            <span className="text-sm">{post.saves}</span>
          </button>

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: post.title,
                  text: `Check out this post on WeRentify: ${post.description}`,
                  url: window.location.href,
                });
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert("Link copied to clipboard!");
              }
            }}
            className="hover:text-gray-900 cursor-pointer hover:scale-110 transition-transform"
          >
            <Share size={18} />
          </button>
        </div>

        <button 
          onClick={() => {
            if (!isLoggedIn) {
              setShowLogin(true);
            } else {
              setMessagePost(post);
              setShowPostMessage(true);
            }
          }}
          className="px-4 py-2 cursor-pointer rounded-xl text-sm font-semibold text-white bg-linear-to-r from-indigo-500 to-pink-500 hover:shadow-lg transition-all"
        >
          💬 Message
        </button>
      </div>
    </div>
  );
}