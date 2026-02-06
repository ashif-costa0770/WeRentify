"use client";

import { X, MessageCircle } from "lucide-react";
import { timeAgo } from "@/utils/timeAgo";

export default function CommentModal({ post, isOpen, onClose, isLoggedIn, setShowLogin }) {
  if (!isOpen || !post) return null;

  const isService = post.type === "service";

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl z-50 w-[90%] max-w-3xl max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white flex items-center justify-center font-bold text-lg">
                {post.author.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-900">{post.author}</p>
                <p className="text-sm text-gray-500">{timeAgo(post.timestamp)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                  isService
                    ? "bg-orange-100 text-orange-600"
                    : "bg-purple-100 text-purple-600"
                }`}
              >
                {isService ? "🔧 Service" : "📦 Item"}
              </span>
              
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 cursor-pointer rounded-full transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Title */}
          <h2 className="font-bold text-xl text-gray-900 mb-3">{post.title}</h2>

          {/* Description */}
          <p className="text-sm text-gray-700 mb-4">{post.description}</p>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="flex items-center text-gray-600 gap-1">
              📍 {post.location}
            </span>
            <span className="flex items-center text-gray-600 gap-1">
              📅 {post.dateNeeded}
            </span>
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">
              💰 {post.budget}
            </span>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 mt-4 text-sm">
            <span className="flex items-center gap-1 text-rose-600 font-semibold">
              ❤️ {post.likes} Likes
            </span>
            <span className="flex items-center gap-1 text-gray-600 font-semibold">
              💬 {post.comments} Comments
            </span>
            <span className="flex items-center gap-1 text-indigo-600 font-semibold">
              🔖 Saved
            </span>
          </div>
        </div>

        {/* Comments Section */}
        <div className="p-6 ">
          <h3 className="font-bold text-lg text-gray-900 mb-4">Comments</h3>

          {/* Comments List - Scrollable */}
          <div className="max-h-[300px] text-gray-500 overflow-y-auto mb-4">
            {post.comments === 0 ? (
              <div className="text-center text-gray-500 py-12">
                <MessageCircle size={48} className="mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500">
                  No comments yet. Be the first to comment!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Example comment - you can map through actual comments */}
                {/* {post.commentsList?.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {comment.author.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="font-semibold text-sm text-gray-900">{comment.author}</p>
                        <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 ml-1">{timeAgo(comment.timestamp)}</p>
                    </div>
                  </div>
                ))} */}
              </div>
            )}
          </div>

          {/* Comment Input */}
          {isLoggedIn ? (
            <div className="flex gap-3 text-gray-800 items-start  pt-4">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white flex items-center justify-center font-bold flex-shrink-0">
                U
              </div>
              <div className="flex-1">
                <textarea
                  placeholder="Write a comment..."
                  className="w-full border border-gray-400 rounded-xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all"
                  rows="3"
                />
                <div className="flex justify-end mt-2">
                  <button   onClick={onClose} className="bg-gradient-to-r from-indigo-500 to-pink-500 cursor-pointer text-white px-6 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all">
                    Post Comment
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center border-t border-gray-100 pt-6">
              <p className="text-gray-600 mb-3">
                Please{" "}
                <button
                  onClick={() => {
                    onClose();
                    setShowLogin(true);
                  }}
                  className="text-indigo-600 font-semibold underline hover:text-indigo-700"
                >
                  log in
                </button>{" "}
                to comment
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}