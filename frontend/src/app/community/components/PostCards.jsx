// "use client";

// import { Heart, MessageCircle, Share, Bookmark } from "lucide-react";
// import { timeAgo } from "@/utils/timeAgo";
// import { formatDate } from "@/utils/formatDate";
// import { likePost, savePost } from "@/services/post.service";

// export default function PostCard({
//   post,
//   likedPosts = [],
//   setLikedPosts = () => {},
//   savedPosts = [],
//   setSavedPosts = () => {},
//   setSelectedPost = () => {},
//   isLoggedIn = false,
//   setShowLogin = () => {},
//   setMessagePost = () => {},
//   setShowPostMessage = () => {},
// }) {
//   const isService = post.type === "service";

//   const authorName =
//     typeof post.author === "string"
//       ? post.author
//       : post.author?.name || "Unknown";

//   const TEMP_USER_ID = "temp-user-123";

//   const isLiked =
//     post.likes?.includes(TEMP_USER_ID) || likedPosts.includes(post._id);

//   return (
//     <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all py-2 px-4">
//       {/* Header */}
//       <div className="flex items-center justify-between mb-3">
//         <div className="flex items-center gap-3">
//           <div className="w-9 h-9 rounded-full bg-linear-to-r from-indigo-500 to-pink-500 text-white flex items-center justify-center font-bold">
//             {authorName.charAt(0)}
//           </div>

//           <div>
//             <p className="font-semibold text-sm text-gray-900">{authorName}</p>
//             <p className="text-xs text-gray-500">{timeAgo(post.timestamp)}</p>
//           </div>
//         </div>

//         <span
//           className={`px-3 py-1 rounded-full text-xs font-semibold ${
//             isService
//               ? "bg-orange-100 text-orange-600"
//               : "bg-purple-100 text-purple-600"
//           }`}
//         >
//           {isService ? "🔧 Service" : "📦 Item"}
//         </span>
//       </div>

//       {/* Title */}
//       <h3 className="font-bold text-gray-900 mb-1">{post.title}</h3>

//       {/* Description */}
//       <div
//         className="text-[13px] text-gray-600 mb-4 line-clamp-3 prose prose-sm max-w-none"
//         dangerouslySetInnerHTML={{ __html: post.description }}
//       />

//       {/* Meta */}
//       <div className="flex flex-wrap items-center gap-1.5 text-[11px] mb-4">
//         <span className="flex items-center text-gray-500 gap-1 bg-gray-100 px-2 py-1 rounded-full">
//           📍 {post.location}
//         </span>

//         <span className="flex items-center  text-gray-500 gap-1 bg-gray-100 px-2 py-1 rounded-full">
//           📅 {formatDate(post.dateNeeded)}
//         </span>

//         <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
//           💰 {post.budget}
//         </span>

//         <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-semibold">
//           📍 {post.distance} mi
//         </span>
//       </div>

//       {/* Footer */}
//       <div className="flex items-center justify-between">
//         <div className="flex items-center gap-4 text-gray-600">
//           <button
//             onClick={async () => {
//               try {
//                 // optimistic update
//                 if (isLiked) {
//                   setLikedPosts(likedPosts.filter((id) => id !== post._id));
//                 } else {
//                   setLikedPosts([...likedPosts, post._id]);
//                 }

//                 await likePost(post._id);
//               } catch (err) {
//                 console.error(err);
//               }
//             }}
//           >
//             <Heart
//               size={18}
//               className={isLiked ? "fill-rose-500 text-rose-500" : ""}
//             />
//             <span>{post.likes.length}</span>
//           </button>

//           <button
//             onClick={(e) => {
//               e.stopPropagation();
//               setSelectedPost(post);
//             }}
//             className="flex cursor-pointer items-center gap-1 hover:text-indigo-500 hover:scale-110 transition-transform"
//           >
//             <MessageCircle size={18} />
//             <span className="text-sm">{post.comments}</span>
//           </button>

//           <button
//             onClick={() => {
//               if (savedPosts.includes(post.id)) {
//                 setSavedPosts(savedPosts.filter((id) => id !== post.id));
//               } else {
//                 setSavedPosts([...savedPosts, post.id]);
//               }
//             }}
//             className="flex cursor-pointer items-center gap-1 hover:text-gray-900 hover:scale-110 transition-transform"
//           >
//             <Bookmark
//               size={18}
//               className={
//                 savedPosts.includes(post.id)
//                   ? "fill-indigo-500 text-indigo-500"
//                   : ""
//               }
//             />
//             <span className="text-sm">{post.saves}</span>
//           </button>

//           <button
//             onClick={() => {
//               if (navigator.share) {
//                 navigator.share({
//                   title: post.title,
//                   text: `Check out this post on WeRentify: ${post.description}`,
//                   url: window.location.href,
//                 });
//               } else {
//                 navigator.clipboard.writeText(window.location.href);
//                 alert("Link copied to clipboard!");
//               }
//             }}
//             className="hover:text-gray-900 cursor-pointer hover:scale-110 transition-transform"
//           >
//             <Share size={18} />
//           </button>
//         </div>

//         <button
//           onClick={() => {
//             if (!isLoggedIn) {
//               setShowLogin(true);
//             } else {
//               setMessagePost(post);
//               setShowPostMessage(true);
//             }
//           }}
//           className="px-4 py-2 cursor-pointer rounded-xl text-sm font-semibold text-white bg-linear-to-r from-indigo-500 to-pink-500 hover:shadow-lg transition-all"
//         >
//           💬 Message
//         </button>
//       </div>
//     </div>
//   );
// }










"use client";

import { Heart, MessageCircle, Share, Bookmark } from "lucide-react";
import { timeAgo } from "@/utils/timeAgo";
import { likePost, savePost } from "@/services/post.service";
import { formatDate } from "@/utils/formatDate";

export default function PostCard({
  post,
  currentUser,
  onOpenComments = () => {},
  onRequireLogin = () => {},
  setMessagePost = () => {},
  setShowPostMessage = () => {}
}) {

  const authorName =
    typeof post.author === "string"
      ? post.author
      : post.author?.name || "Unknown"; 

  const isService = post.type === "service";

  const isLiked = currentUser
    ? post.likes.includes(currentUser._id)
    : false;

  const isSaved = currentUser
    ? post.saves.includes(currentUser._id)
    : false;

  const handleLike = async () => {
    if (!currentUser) return onRequireLogin();

    try {
      await toggleLikePost(post._id);
    } catch (err) {
      console.error("Like failed", err);
    }
  };

  const handleSave = async () => {
    if (!currentUser) return onRequireLogin();

    try {
      await toggleSavePost(post._id);
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all py-2 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-linear-to-r from-indigo-500 to-pink-500 text-white flex items-center justify-center font-bold">
            {post.user?.name?.charAt(0) || "U"}
          </div>

          <div>
            <p className="font-semibold text-sm text-gray-900">
              {post.user?.name || "Unknown User"}
            </p>
            <p className="text-xs text-gray-500">
              {timeAgo(post.createdAt)}
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
      <h3 className="font-bold text-gray-900 mb-1">{post.title}</h3>

      {/* Description */}
      <div
        className="text-[13px] text-gray-600 mb-4 line-clamp-3 prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: post.description }}
      />

      {/* Meta */}
      <div className="flex flex-wrap items-center gap-1.5 text-[11px] mb-4">
        <span className="bg-gray-100 px-2 py-1 rounded-full">
          📍 {post.location}
        </span>

        <span className="flex items-center  text-gray-500 gap-1 bg-gray-100 px-2 py-1 rounded-full">
          📅 {formatDate(post.dateNeeded)}
        </span>

        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
          💰 {post.budget}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-gray-600">

          {/* Like */}
          <button
            onClick={handleLike}
            className="flex items-center gap-1 hover:text-red-500 transition"
          >
            <Heart
              size={18}
              className={isLiked ? "fill-rose-500 text-rose-500" : ""}
            />
            <span className="text-sm">{post.likes.length}</span>
          </button>

          {/* Comments */}
          <button
           onClick={(e) => {
              e.stopPropagation();
              onOpenComments(post);
            }}
            className="flex items-center gap-1 hover:text-indigo-500 transition"
          >
            <MessageCircle size={18} />
            <span className="text-sm">{post.commentsCount || 0}</span>
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            className="flex items-center gap-1 hover:text-gray-900 transition"
          >
            <Bookmark
              size={18}
              className={isSaved ? "fill-indigo-500 text-indigo-500" : ""}
            />
            <span className="text-sm">{post.saves.length}</span>
          </button>

          {/* Share */}
          <button
            onClick={() => {
              navigator.share
                ? navigator.share({
                    title: post.title,
                    text: post.description,
                    url: window.location.href,
                  })
                : navigator.clipboard.writeText(window.location.href);
            }}
            className="hover:text-gray-900 transition"
          >
            <Share size={18} />
          </button>
        </div>

        <button className="px-4 py-2 rounded-xl text-sm font-semibold text-white bg-linear-to-r from-indigo-500 to-pink-500">
          💬 Message
        </button>
      </div>
    </div>
  );
}
