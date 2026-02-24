"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import PostCard from "./PostCards";
import CommentModal from "./modals/CommentModal";
import MessageModal from "./modals/MessageModal";

export default function PostsGrid({ posts, currentUser = null, onUpdatePost }) {
  const [selectedPost, setSelectedPost] = useState(null);
  const [messagePost, setMessagePost] = useState(null);
  const [showPostMessage, setShowPostMessage] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleRequireLogin = () => {
    toast.error("Please login first");
    const redirectTo = pathname || "/community";
    router.push(`/?auth=signin&redirect=${encodeURIComponent(redirectTo)}`);
  };

  if (!posts?.length) {
    return <p className="text-center text-gray-500 py-16">No posts found</p>;
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8">
        {posts.map((post) => (
          <PostCard
            key={post._id}
            post={post}
            currentUser={currentUser}
            onOpenComments={(post) => setSelectedPost(post)}
            onRequireLogin={handleRequireLogin}
            setShowPostMessage={setShowPostMessage}
            setMessagePost={setMessagePost}
            onUpdatePost={onUpdatePost}
          />
        ))}
      </div>

      {/* Comment Modal */}
      <CommentModal
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
        currentUser={currentUser}
        onRequireLogin={handleRequireLogin}
        onUpdatePost={onUpdatePost}
      />

      {/* Message Modal */}
      <MessageModal
        isOpen={showPostMessage}
        post={messagePost}
        onClose={() => {
          setShowPostMessage(false);
          setMessagePost(null);
        }}
      />

    </>
  );
}
