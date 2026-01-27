"use client";

import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
} from "lucide-react";
import { timeAgo } from "@/utils/timeAgo";

export default function PostCard({ post }) {
  const isService = post.type === "service";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all p-4">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white flex items-center justify-center font-bold">
            {post.author.charAt(0)}
          </div>

          <div>
            <p className="font-semibold text-sm text-gray-900">
              {post.author}
            </p>
            <p className="text-xs text-gray-500">
              {timeAgo(post.timestamp)}
            </p>
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
      <h3 className="font-bold text-gray-900 mb-1">
        {post.title}
      </h3>

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
          <button className="flex items-center gap-1 hover:text-red-500">
            <Heart size={18} />
            <span className="text-sm">{post.likes}</span>
          </button>

          <button className="flex items-center gap-1 hover:text-indigo-500">
            <MessageCircle size={18} />
            <span className="text-sm">{post.comments}</span>
          </button>

          <button className="flex items-center gap-1 hover:text-gray-900">
            <Bookmark size={18} />
            <span className="text-sm">{post.saves}</span>
          </button>

          <button className="hover:text-gray-900">
            <Share2 size={18} />
          </button>
        </div>

        <button className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-indigo-500 to-pink-500">
          💬 Message
        </button>
      </div>
    </div>
  );
}
