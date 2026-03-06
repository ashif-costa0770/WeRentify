"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Loader2,
  MessageCircle,
  Search,
  Send,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useUser } from "@/context/UserContext";
import {
  createOrGetConversation,
  getConversations,
  getMessages,
  markMessagesSeen,
  sendMessage,
} from "@/services/message.service";
import { getListingById } from "@/services/item.service";
import { getPostById } from "@/services/post.service";
import { getServiceById } from "@/services/services.service";
import { socket } from "@/lib/socket";

const formatTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const now = new Date();
  const diffMin = Math.floor((now.getTime() - date.getTime()) / 60000);
  if (diffMin < 1) return "now";
  if (diffMin < 60) return `${diffMin}m`;

  const sameDay = now.toDateString() === date.toDateString();
  if (sameDay) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }

  return date.toLocaleDateString([], { month: "short", day: "numeric" });
};

const shortenTitle = (value, maxWords = 4) => {
  const text = String(value || "").trim();
  if (!text) return "Conversation";

  const words = text.split(/\s+/);
  if (words.length <= maxWords) return text;
  return `${words.slice(0, maxWords).join(" ")} ...`;
};

const Avatar = ({ src, name, size = 40, className = "" }) => {
  const initial = (name || "U").charAt(0).toUpperCase();

  return (
    <div
      className={`rounded-full overflow-hidden bg-indigo-100 text-indigo-700 flex items-center justify-center font-semibold shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      {src ? (
        <Image
          src={src}
          alt={name || "User"}
          width={size}
          height={size}
          className="w-full h-full object-cover"
        />
      ) : (
        initial
      )}
    </div>
  );
};

export default function MessageSlider({
  showMessages,
  setShowMessages,
  selectedConversation,
}) {
  const { user } = useUser();
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [isInboxLoading, setIsInboxLoading] = useState(false);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [conversationTitles, setConversationTitles] = useState({});
  const endRef = useRef(null);

  const activeConversationId = activeConversation?._id || null;

  const resolveOtherParticipant = useCallback(
    (conversation) => {
      const participants = conversation?.participants || [];
      return participants.find((p) => String(p?._id) !== String(user?._id));
    },
    [user?._id],
  );

  const sortConversations = useCallback(
    (items) =>
      [...items].sort((a, b) => {
        const aTime = new Date(a?.lastMessage?.createdAt || a?.updatedAt || 0).getTime();
        const bTime = new Date(b?.lastMessage?.createdAt || b?.updatedAt || 0).getTime();
        return bTime - aTime;
      }),
    [],
  );

  const activeOtherUser = useMemo(() => {
    if (!activeConversation) return null;
    return resolveOtherParticipant(activeConversation) || null;
  }, [activeConversation, resolveOtherParticipant]);

  const activeOtherName = useMemo(() => {
    const other = activeOtherUser;
    return (
      `${other?.firstname || ""} ${other?.lastname || ""}`.trim() ||
      other?.firstname ||
      "User"
    );
  }, [activeOtherUser]);

  const filteredConversations = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return conversations;

    return conversations.filter((conversation) => {
      const other = resolveOtherParticipant(conversation);
      const otherName =
        `${other?.firstname || ""} ${other?.lastname || ""}`.trim() || other?.firstname || "";
      const titleKey = `${conversation?.refModel}:${conversation?.refId}`;
      const title =
        conversationTitles[titleKey] ||
        (conversation?.refModel === "Post" ? "Post" : conversation?.refModel === "Listing" ? "Listing" : "Conversation");
      return (
        otherName.toLowerCase().includes(term) ||
        title.toLowerCase().includes(term)
      );
    });
  }, [conversations, search, resolveOtherParticipant, conversationTitles]);

  const getConversationTitle = useCallback(async (conversation) => {
    try {
      if (!conversation?.refId || !conversation?.refModel) return "Conversation";

      if (conversation.refModel === "Listing") {
        const res = await getListingById(conversation.refId);
        return res?.data?.data?.itemName || res?.data?.data?.name || "Listing";
      }

      if (conversation.refModel === "Post") {
        const res = await getPostById(conversation.refId);
        return res?.data?.data?.title || "Post";
      }

      if (conversation.refModel === "Service") {
        const res = await getServiceById(conversation.refId);
        return (
          res?.data?.data?.service?.businessName ||
          res?.data?.data?.service?.serviceType ||
          res?.data?.service?.businessName ||
          "Service"
        );
      }

      return "Conversation";
    } catch {
      if (conversation?.refModel === "Post") return "Post";
      if (conversation?.refModel === "Service") return "Service";
      return "Listing";
    }
  }, []);

  const loadConversations = useCallback(async () => {
    setIsInboxLoading(true);
    try {
      const res = await getConversations();
      const list = Array.isArray(res?.data?.data) ? res.data.data : [];
      const sorted = sortConversations(list);
      setConversations(sorted);
      return sorted;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to load conversations");
      setConversations([]);
      return [];
    } finally {
      setIsInboxLoading(false);
    }
  }, [sortConversations]);

  const loadMessages = useCallback(
    async (conversationId) => {
      if (!conversationId) return;

      setIsMessagesLoading(true);
      try {
        const res = await getMessages(conversationId);
        const list = Array.isArray(res?.data?.data) ? res.data.data : [];
        setMessages(list);
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to load messages");
        setMessages([]);
      } finally {
        setIsMessagesLoading(false);
      }

      try {
        await markMessagesSeen(conversationId);
        setConversations((prev) =>
          prev.map((item) =>
            item._id === conversationId
              ? {
                  ...item,
                  unreadCounts: {
                    ...(item.unreadCounts || {}),
                    [user?._id]: 0,
                  },
                }
              : item,
          ),
        );
      } catch (error) {
        toast.error(error?.response?.data?.message || "Seen update failed");
      }
    },
    [user?._id],
  );

  const openConversation = useCallback(
    async (conversation) => {
      if (!conversation?._id) return;
      setActiveConversation(conversation);
      await loadMessages(conversation._id);
    },
    [loadMessages],
  );

  const openOrCreateFromSelection = useCallback(
    async (selection) => {
      if (!selection) return false;

      if (selection.conversationId) {
        const all = await loadConversations();
        const fromList = all.find((c) => c._id === selection.conversationId);
        if (fromList) {
          await openConversation(fromList);
        } else {
          await openConversation({ _id: selection.conversationId, participants: [] });
        }
        return true;
      }

      if (!selection.itemId) return false;

      try {
        const refModel = selection.refModel || "Listing";
        const res = await createOrGetConversation({
          refId: selection.itemId,
          refModel,
        });
        const conversation = res?.data?.data;
        if (!conversation?._id) return false;

        const all = await loadConversations();
        const fromList = all.find((c) => c._id === conversation._id) || conversation;
        await openConversation(fromList);
        return true;
      } catch (error) {
        toast.error(error?.response?.data?.message || "Failed to open chat");
        return false;
      }
    },
    [loadConversations, openConversation],
  );

  useEffect(() => {
    if (!showMessages || !user?._id) return;

    const run = async () => {
      const handled = await openOrCreateFromSelection(selectedConversation);
      if (handled) return;

      const list = await loadConversations();
      if (list.length > 0) {
        await openConversation(list[0]);
      }
    };

    run();
  }, [
    showMessages,
    user?._id,
    selectedConversation,
    loadConversations,
    openConversation,
    openOrCreateFromSelection,
  ]);

  useEffect(() => {
    if (!showMessages || conversations.length === 0) return;

    const loadTitles = async () => {
      const unique = new Map();
      for (const conversation of conversations) {
        const key = `${conversation?.refModel}:${conversation?.refId}`;
        if (conversation?.refModel && conversation?.refId && !conversationTitles[key] && !unique.has(key)) {
          unique.set(key, conversation);
        }
      }
      if (unique.size === 0) return;

      const entries = await Promise.all(
        [...unique.entries()].map(async ([key, conversation]) => [key, await getConversationTitle(conversation)]),
      );

      setConversationTitles((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
    };

    loadTitles();
  }, [showMessages, conversations, conversationTitles, getConversationTitle]);

  useEffect(() => {
    if (!showMessages) return;

    const onNewMessage = (incoming) => {
      if (!incoming?.conversation) return;

      setConversations((prev) => {
        const exists = prev.some((c) => c._id === incoming.conversation);
        if (!exists) return prev;

        const updated = prev.map((item) =>
          item._id === incoming.conversation
            ? {
                ...item,
                lastMessage: {
                  text: incoming.text,
                  sender: incoming.sender,
                  createdAt: incoming.createdAt,
                },
              }
            : item,
        );

        return sortConversations(updated);
      });

      if (incoming.conversation === activeConversationId) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === incoming._id)) return prev;
          return [...prev, incoming];
        });
        markMessagesSeen(incoming.conversation).catch(() => {});
      }
    };

    socket.on("new_message", onNewMessage);
    return () => {
      socket.off("new_message", onNewMessage);
    };
  }, [showMessages, activeConversationId, sortConversations]);

  useEffect(() => {
    if (!showMessages) return;
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, showMessages]);

  if (!showMessages) return null;

  const activeTitleKey = `${activeConversation?.refModel}:${activeConversation?.refId}`;
  const activeTitle = conversationTitles[activeTitleKey];
  const activeContextLabel =
    activeConversation?.refModel && activeTitle
      ? `${activeConversation.refModel} - ${activeTitle}`
      : activeConversation?.refModel || "Conversation";

  const handleSend = async () => {
    const text = message.trim();
    if (!text || !activeConversationId || isSending) return;

    try {
      setIsSending(true);
      const res = await sendMessage({ conversationId: activeConversationId, text });
      const newMessage = res?.data?.data;

      if (newMessage?._id) {
        setMessages((prev) => [...prev, newMessage]);
        setConversations((prev) =>
          sortConversations(
            prev.map((item) =>
              item._id === activeConversationId
                ? {
                    ...item,
                    lastMessage: {
                      text: newMessage.text,
                      sender: newMessage.sender,
                      createdAt: newMessage.createdAt,
                    },
                  }
                : item,
            ),
          ),
        );
      }

      setMessage("");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Failed to send message");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] p-4 sm:p-6">
      <div
        className="absolute inset-0 bg-slate-900/45 backdrop-blur-sm"
        onClick={() => setShowMessages(false)}
      />

      <div className="relative mx-auto h-full max-h-[88vh] w-full max-w-[70vw] overflow-hidden rounded-3xl border border-white/40 bg-white shadow-2xl">
        <div className="grid h-full grid-cols-1 md:grid-cols-[300px_1fr]">
          <aside
            className={`border-r border-gray-100 bg-gradient-to-b from-slate-50 to-white ${
              activeConversation ? "hidden md:block" : "block"
            }`}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Messages</h2>
             
            </div>

            <div className="px-5 py-3 border-b border-gray-100">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search conversations"
                  className="w-full rounded-xl border border-gray-200 bg-white pl-9 pr-3 py-2 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="h-[calc(88vh-122px)] overflow-y-auto">
              {isInboxLoading ? (
                <div className="flex items-center justify-center py-10 text-gray-500">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading...
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="px-6 py-12 text-center text-gray-500">
                  <MessageCircle className="mx-auto mb-2 text-gray-300" />
                  No conversations
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {filteredConversations.map((conversation) => {
                    const other = resolveOtherParticipant(conversation);
                    const otherName =
                      `${other?.firstname || ""} ${other?.lastname || ""}`.trim() ||
                      other?.firstname ||
                      "User";
                    const unread = Number(conversation?.unreadCounts?.[user?._id] || 0);
                    const isActive = conversation._id === activeConversationId;
                    const titleKey = `${conversation?.refModel}:${conversation?.refId}`;
                    const title =
                      conversationTitles[titleKey] ||
                      (conversation?.refModel === "Post"
                        ? "Post"
                        : conversation?.refModel === "Service"
                          ? "Service"
                          : conversation?.refModel === "Listing"
                          ? "Listing"
                          : "Conversation");
                    const shortTitle = shortenTitle(title);

                    return (
                      <button
                        key={conversation._id}
                        type="button"
                        onClick={() => openConversation(conversation)}
                        className={`w-full px-5 py-3.5 cursor-pointer text-left transition-colors ${
                          isActive ? "bg-indigo-50" : "hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <Avatar
                            src={other?.avatar?.url}
                            name={otherName}
                            size={42}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-2">
                              <p className="truncate text-sm font-semibold text-gray-900">{otherName}</p>              
                              <span className="text-xs text-gray-500 shrink-0">
                                {formatTime(conversation?.lastMessage?.createdAt || conversation?.updatedAt)}
                              </span>
                            </div>
                            <p className="mt-0.5 truncate text-xs font-medium text-indigo-600">
                              {shortTitle}
                            </p>
                            <div className="mt-0.5 flex items-center justify-between gap-2">
                              <p className="truncate text-xs text-gray-600">
                                {conversation?.lastMessage?.text || "No messages yet"}
                              </p>
                              {unread > 0 ? (
                                <span className="min-w-5 h-5 px-1 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center shrink-0">
                                  {unread}
                                </span>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </aside>

          <section className={`min-h-0 flex flex-col bg-white ${activeConversation ? "flex" : "hidden md:flex"}`}>
            {activeConversation ? (
              <>
                 <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      type="button"
                      onClick={() => setActiveConversation(null)}
                      className="md:hidden rounded-full p-2 text-gray-500 hover:bg-gray-100"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <Avatar
                      src={activeOtherUser?.avatar?.url}
                      name={activeOtherName}
                      size={48}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-gray-900">{activeOtherName}</p>
                      <p className="text-xs text-gray-500 truncate">{activeContextLabel}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowMessages(false)}
                    className="rounded-full cursor-pointer p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.05),transparent_35%),radial-gradient(circle_at_80%_80%,rgba(236,72,153,0.06),transparent_35%)] px-5 py-5">
                  {isMessagesLoading ? (
                    <div className="flex justify-center py-6">
                      <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                    </div>
                  ) : null}

                  <div className="space-y-4">
                    {messages.map((msg) => {
                      const isMine = String(msg.sender) === String(user?._id);
                      return (
                        <div
                          key={msg._id || `${msg.createdAt}-${msg.sender}`}
                          className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                        >
                          <div className={`max-w-[80%] ${isMine ? "items-end" : "items-start"} flex flex-col`}>
                            <div
                              className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                isMine
                                  ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-br-sm"
                                  : "bg-white text-gray-900 border border-gray-100 rounded-bl-sm"
                              }`}
                            >
                              {msg.text}
                            </div>
                            <span className="mt-1.5 px-1 text-[11px] text-gray-400">{formatTime(msg.createdAt)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div ref={endRef} />
                </div>

                <div className="border-t border-gray-100 px-5 py-4">
                  <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-2 py-2 shadow-sm transition focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-100">
                    <input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Write a message..."
                      className="flex-1 bg-transparent px-2 text-sm outline-none"
                    />
                    <button
                      onClick={handleSend}
                      disabled={isSending || !message.trim()}
                      type="button"
                      className="inline-flex cursor-pointer h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="hidden md:flex flex-1 items-center justify-center text-gray-500">
                <div className="text-center">
                  <MessageCircle className="mx-auto mb-3 text-gray-300" />
                  <p>Select a conversation to start chatting</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
