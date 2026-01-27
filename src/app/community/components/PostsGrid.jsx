    "use client";

import PostCard from "./PostCards";

export default function PostsGrid({ posts }) {
  if (!posts?.length) {
    return (
      <p className="text-center text-gray-500 py-16">
        No posts found
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
}
