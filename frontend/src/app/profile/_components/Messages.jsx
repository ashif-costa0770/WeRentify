"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Loader2, MessageCircle, Search } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { getConversations } from "@/services/message.service";
import { getListingById } from "@/services/item.service";
import { getPostById } from "@/services/post.service";

const formatMessageTime = (value) => {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin} min`;

  const sameDay = now.toDateString() === date.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

export default function Messages() {
  const { user, setSelectedConversation, setShowMessages } = useUser();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [titles, setTitles] = useState({});
  const [searchTerm, setSearchTerm] = useState("");

  const getConversationTitle = useCallback(async (conversation) => {
    try {
      if (!conversation?.refId || !conversation?.refModel) {
        return "Conversation";
      }

      if (conversation.refModel === "Listing") {
        const res = await getListingById(conversation.refId);
        return (
          res?.data?.data?.itemName ||
          res?.data?.data?.name ||
          "Listing conversation"
        );
      }

      if (conversation.refModel === "Post") {
        const res = await getPostById(conversation.refId);
        return res?.data?.data?.title || "Post conversation";
      }

      return "Conversation";
    } catch {
      return conversation?.refModel === "Post"
        ? "Post conversation"
        : "Listing conversation";
    }
  }, []);

  const loadInbox = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getConversations();
      const list = Array.isArray(res?.data?.data) ? res.data.data : [];
      const sorted = [...list].sort((a, b) => {
        const aTime = new Date(
          a?.lastMessage?.createdAt || a?.updatedAt || 0,
        ).getTime();
        const bTime = new Date(
          b?.lastMessage?.createdAt || b?.updatedAt || 0,
        ).getTime();
        return bTime - aTime;
      });
      setConversations(sorted);

      const uniqueRefKeys = new Map();
      for (const item of sorted) {
        const key = `${item.refModel}:${item.refId}`;
        if (!uniqueRefKeys.has(key)) {
          uniqueRefKeys.set(key, item);
        }
      }

      const entries = await Promise.all(
        [...uniqueRefKeys.entries()].map(async ([key, conversation]) => {
          const title = await getConversationTitle(conversation);
          return [key, title];
        }),
      );

      setTitles(Object.fromEntries(entries));
    } finally {
      setLoading(false);
    }
  }, [getConversationTitle]);

  useEffect(() => {
    loadInbox();
  }, [loadInbox]);

  const rows = useMemo(() => {
    return conversations.map((conversation) => {
      const participants = conversation?.participants || [];
      const otherUser = participants.find(
        (p) => String(p?._id) !== String(user?._id),
      );
      const otherName =
        `${otherUser?.firstname || ""} ${otherUser?.lastname || ""}`.trim() ||
        otherUser?.firstname ||
        "User";
      const unreadCount = Number(conversation?.unreadCounts?.[user?._id] || 0);
      const titleKey = `${conversation.refModel}:${conversation.refId}`;
      const title =
        titles[titleKey] ||
        (conversation.refModel === "Post"
          ? "Post conversation"
          : "Listing conversation");

      return {
        conversation,
        otherName,
        avatarUrl: otherUser?.avatar?.url || null,
        lastMessage:
          conversation?.lastMessage?.text || "Start the conversation...",
        unreadCount,
        title,
        timeLabel: formatMessageTime(
          conversation?.lastMessage?.createdAt || conversation?.updatedAt,
        ),
      };
    });
  }, [conversations, titles, user?._id]);

  const filteredRows = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return rows;

    return rows.filter((row) => {
      const userName = (row.otherName || "").toLowerCase();
      const title = (row.title || "").toLowerCase();
      return userName.includes(term) || title.includes(term);
    });
  }, [rows, searchTerm]);

  return (
    <section className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Messages</h2>
            <p className="text-sm text-gray-500 mt-1">Your inbox conversations</p>
          </div>

          <div className="relative w-full md:w-[280px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by user or title"
              className="h-10 w-full rounded-xl border border-gray-300 bg-white pl-9 pr-3 text-sm text-gray-700 outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-16 flex items-center justify-center text-gray-500">
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
          Loading inbox...
        </div>
      ) : rows.length === 0 ? (
        <div className="py-16 text-center px-6">
          <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-700 font-medium">No messages yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Start chatting from any listing or community post.
          </p>
        </div>
      ) : filteredRows.length === 0 ? (
        <div className="py-16 text-center px-6">
          <MessageCircle className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-700 font-medium">No conversations found</p>
          <p className="text-sm text-gray-500 mt-1">
            Try searching by user name or conversation title.
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {filteredRows.map((row) => (
            <button
              key={row.conversation._id}
              type="button"
              onClick={() => {
                setSelectedConversation({
                  conversationId: row.conversation._id,
                });
                setShowMessages(true);
              }}
              className="w-full text-left px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold shrink-0">
                  {row.avatarUrl ? (
                    <Image
                      src={row.avatarUrl}
                      alt={row.otherName}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    row.otherName.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {row.otherName}
                      </p>
                      <p className="mt-0.5 truncate text-xs font-medium text-indigo-600">
                        {row.title}
                      </p>
                    </div>
                    <div className="text-xs text-gray-500 shrink-0">
                      {row.timeLabel}
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-3 mt-1">
                    <p className="text-sm text-gray-600 truncate">
                      {row.lastMessage}
                    </p>
                    {row.unreadCount > 0 ? (
                      <span className="min-w-5 h-5 px-1 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center shrink-0">
                        {row.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
