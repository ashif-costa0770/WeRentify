"use client";

import { X, MessageCircle, Trash2, Edit3, Check, XCircle } from "lucide-react";
import { timeAgo } from "@/utils/timeAgo";
import { formatDate } from "@/utils/formatDate";
import { useState, useEffect, useCallback } from "react";
import {
  getComments,
  createComment,
  updateComment,
  deleteComment,
} from "@/services/comment.service";
import { toast } from "sonner";

export default function CommentModal({
  post,
  isOpen,
  onClose,
  currentUser,
  setShowLogin,
  onUpdatePost = () => {},
}) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔹 Fetch comments from backend
  const fetchComments = useCallback(async () => {
    if (!post?._id) return;
    try {
      setLoading(true);
      const res = await getComments(post._id);
      if (res.data.success) {
        setComments(res.data.data.comments || []);
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error);
    } finally {
      setLoading(false);
    }
  }, [post?._id]);

  // 🔹 Load comments on open
  useEffect(() => {
    if (isOpen) {
      fetchComments();
    } else {
      setComments([]);
      setCommentText("");
      setEditingId(null);
    }
  }, [isOpen, fetchComments]);

  // 🔹 Create Comment
  const handleCreate = async () => {
    if (!commentText.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const res = await createComment(post._id, { text: commentText });
      if (res.data.success) {
        setCommentText("");
        fetchComments();
        const newCount = (post.commentsCount || 0) + 1;
        onUpdatePost({ ...post, commentsCount: newCount });
      }
    } catch (error) {
      console.error("Failed to create comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔹 Update Comment
  const handleUpdate = async (commentId) => {
    if (!editText.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const res = await updateComment(post._id, commentId, { text: editText });
      if (res.data.success) {
        setEditingId(null);
        setEditText("");
        fetchComments();
      }
      toast.success("Comment updated!");
    } catch (error) {
      console.error("Failed to update comment:", error);
      toast.error("Failed to update comment: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🔹 Delete Comment
  const handleDelete = async (commentId) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    try {
      const res = await deleteComment(post._id, commentId);
      if (res.data.success) {
        fetchComments();
        const newCount = Math.max(0, (post.commentsCount || 0) - 1);
        onUpdatePost({ ...post, commentsCount: newCount });
        toast.success("Comment deleted!");
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
      toast.error("Failed to delete comment: " + error.message);
    }
  };

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
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-3xl shadow-2xl z-50 w-[90%] max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-linear-to-r from-indigo-500 to-pink-500 text-white flex items-center justify-center font-bold text-lg">
                {post.author?.name?.charAt(0) || "C"}
              </div>
              <div>
                <p className="font-bold text-gray-900">
                  {post.author?.name || "Unknown"}
                </p>
                <p className="text-sm text-gray-500">
                  {timeAgo(post.createdAt)}
                </p>
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
                aria-label="Close modal"
              >
                <X size={20} className="text-gray-600" />
              </button>
            </div>
          </div>

          {/* Title & Desc */}
          <h2 className="font-bold text-xl text-gray-900 mb-2 truncate">
            {post.title}
          </h2>
          <div
            className="text-sm text-gray-700 mb-4 line-clamp-2 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: post.description }}
          />

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="flex items-center text-gray-600 gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
              📍 {post.location}
            </span>
            <span className="flex items-center text-gray-600 gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
              📅 {formatDate(post.dateNeeded)}
            </span>
            <span className="bg-green-50 text-green-700 px-3 py-1 rounded-lg border border-green-100 font-semibold">
              💰 {post.budget}
            </span>
          </div>
        </div>

        {/* Comments Section */}
        <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
          <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
            Comments
            <span className="text-sm font-normal text-gray-500">
              ({comments.length})
            </span>
          </h3>

          {loading ? (
            <div className="py-12 text-center text-gray-500">
              <div className="animate-spin w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading comments...</p>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center text-gray-500 py-12 bg-white rounded-2xl border border-dashed border-gray-200">
              <MessageCircle size={35} className="mx-auto text-gray-300 mb-3" />
              <small>No comments yet. Be the first to comment!</small>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment._id} className="flex gap-3 group">
                  <div className="w-10 h-10 cursor-pointer rounded-full bg-linear-to-r from-indigo-400 to-pink-400 text-white flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {comment.user?.name?.charAt(0) || "U"}
                  </div>
                  <div className="flex-1">
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:border-indigo-100 transition-colors">
                      <div className="flex justify-between items-start">
                        <p className="font-bold text-sm text-gray-900">
                          {comment.user?.name || "User"}
                        </p>
                        {currentUser?._id === comment.user?._id && (
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                            <button
                              onClick={() => {
                                setEditingId(comment._id);
                                setEditText(comment.text);
                              }}
                              className="p-1.5 cursor-pointer text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit3 size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(comment._id)}
                              className="p-1.5 cursor-pointer text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )}
                      </div>

                      {editingId === comment._id ? (
                        <div className="mt-2">
                          <textarea
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                            rows="2"
                            autoFocus
                          />
                          <div className="flex justify-end gap-2 mt-2">
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1 px-2 text-xs font-semibold text-gray-500 hover:bg-gray-100 rounded-lg transition flex items-center gap-1"
                            >
                              <XCircle size={14} /> Cancel
                            </button>
                            <button
                              onClick={() => handleUpdate(comment._id)}
                              disabled={!editText.trim() || isSubmitting}
                              className="p-1 px-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition flex items-center gap-1 shadow-sm"
                            >
                              <Check size={14} /> Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                          {comment.text}
                        </p>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 ml-2 font-medium">
                      {timeAgo(comment.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment Input Area */}
        <div className="p-6 border-t border-gray-100 bg-white flex-shrink-0">
          {currentUser ? (
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-full bg-linear-to-r from-indigo-500 to-pink-500 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
                {currentUser.name?.charAt(0) || "U"}
              </div>
              <div className="flex-1">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a supportive comment..."
                  className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all bg-gray-50/50"
                  rows="2"
                />
                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleCreate}
                    disabled={!commentText.trim() || isSubmitting}
                    className="bg-linear-to-r cursor-pointer from-indigo-600 to-pink-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold hover:shadow-lg active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                  >
                    {isSubmitting ? "Posting..." : "Post Comment"}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 bg-indigo-50 rounded-2xl border border-indigo-100">
              <p className="text-gray-700 text-sm">
                Join the conversation!{" "}
                <button
                  onClick={() => {
                    onClose();
                    setShowLogin(true);
                  }}
                  className="text-indigo-600 font-bold hover:underline"
                >
                  Log in to post a comment
                </button>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
