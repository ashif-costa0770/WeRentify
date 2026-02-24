"use client";

import { Heart, MessageCircle, Share, Bookmark } from "lucide-react";
import { timeAgo } from "@/utils/timeAgo";
import { likePost, savePost } from "@/services/post.service";
import { formatDate } from "@/utils/formatDate";
import { shareOrCopyLink } from "@/utils/shareLink";
import { toast } from "sonner";

export default function PostCard({
  post,
  currentUser,
  onOpenComments = () => {},
  onRequireLogin = () => {},
  setMessagePost = () => {},
  setShowPostMessage = () => {},
  onUpdatePost = () => {},
}) {
  const isService = post.type === "service";
  const authorName =
    `${post.author?.firstname || ""} ${post.author?.lastname || ""}`.trim() ||
    "Unknown";

  const isLiked = currentUser ? post.likes?.includes(currentUser._id) : false;

  const isSaved = currentUser ? post.saves?.includes(currentUser._id) : false;

  const handleLike = async () => {
    if (!currentUser) return onRequireLogin();

    try {
      const res = await likePost(post._id);
      if (res.data.success) {
        onUpdatePost(res.data.data);
      }
    } catch (err) {
      console.error("Like failed", err);
      toast.error(err?.response?.data?.message || "Failed to like post");
    }
  };

  const handleSave = async () => {
    if (!currentUser) return onRequireLogin();

    try {
      const res = await savePost(post._id);
      if (res.data.success) {
        onUpdatePost(res.data.data);
      }
      if (isSaved) {
        toast.success("Post unsaved!");
      } else {
        toast.success("Post saved!");
      }
    } catch (err) {
      console.error("Save failed", err);
      toast.error(err?.response?.data?.message || "Failed to save post");
    }
  };

  const handleMessage = () => {
    if (!currentUser) {
      onRequireLogin();
    } else {
      setMessagePost(post);
      setShowPostMessage(true);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all py-2 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-linear-to-r from-indigo-500 to-pink-500 text-white flex items-center justify-center font-bold">
            {authorName.charAt(0) || "U"}
          </div>

          <div>
            <p className="font-semibold text-sm text-gray-900">{authorName}</p>
            <p className="text-xs text-gray-500">{timeAgo(post.createdAt)}</p>
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
      <div
        className="text-[13px] text-gray-600 mb-4 line-clamp-3 prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: post.description }}
      />

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] mb-4">
        <span className="bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
          📍 {post.location}
        </span>

        <span className="flex items-center text-gray-500 gap-1 bg-gray-100 px-2 py-1 rounded-full">
          📅 {formatDate(post.dateNeeded)}
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
          {/* Like */}
          <button
            onClick={handleLike}
            className="flex items-center gap-1 hover:text-red-500 transition cursor-pointer"
            aria-label={isLiked ? "Unlike post" : "Like post"}
          >
            <Heart
              size={18}
              className={isLiked ? "fill-rose-500 text-rose-500" : ""}
            />
            <span className="text-sm">{post.likes?.length || 0}</span>
          </button>

          {/* Comments */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenComments(post);
            }}
            className="flex items-center gap-1 hover:text-indigo-500 transition cursor-pointer"
            aria-label="Open comments"
          >
            <MessageCircle size={18} />
            <span className="text-sm">{post.commentsCount || 0}</span>
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            className="flex items-center gap-1 hover:text-gray-900 transition cursor-pointer"
            aria-label={isSaved ? "Unsave post" : "Save post"}
          >
            <Bookmark
              size={18}
              className={isSaved ? "fill-indigo-500 text-indigo-500" : ""}
            />
            <span className="text-sm">{post.saves?.length || 0}</span>
          </button>

          {/* Share */}
          <button
            onClick={async () => {
              const result = await shareOrCopyLink({
                title: post.title,
                text: post.description,
                url: `/community?post=${post._id}`,
              });

              if (result === "shared") toast.success("Post shared!");
              else if (result === "copied")
                toast.success("Link copied to clipboard!");
              else if (result !== "cancelled")
                toast.error("Unable to share post right now");
            }}
            className="hover:text-gray-900 transition cursor-pointer"
            aria-label="Share post"
          >
            <Share size={18} />
          </button>
        </div>

        <button
          onClick={handleMessage}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-indigo-500 to-pink-500 cursor-pointer hover:shadow-md transition-all active:scale-95"
        >
          💬 Message
        </button>
      </div>
    </div>
  );
}
