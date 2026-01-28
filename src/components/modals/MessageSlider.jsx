"use client";

import { X, Send } from "lucide-react";
import { useState } from "react";

export default function MessageSlider({
  showMessages,
  setShowMessages,
  selectedConversation,
}) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);

  if (!showMessages) return null;

  const handleSend = () => {
    if (!message.trim()) return;

    const userMsg = {
      id: Date.now(),
      text: message,
      sender: "me",
    };

    setMessages((prev) => [...prev, userMsg]);
    setMessage("");

    // ✅ Auto system reply
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: "Thanks for your message! I'll get back to you shortly.",
          sender: "other",
        },
      ]);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[70]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={() => setShowMessages(false)}
      />

      {/* Slider */}
      <div className="absolute right-0 top-0 h-full w-full max-w-sm bg-white shadow-2xl flex flex-col">
        {/* Top Header */}
        <div className="p-4  bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-between">
          <h2 className="text-lg font-bold">Messages</h2>
          <button onClick={() => setShowMessages(false)} className="cursor-pointer">
            <X size={22} />
          </button>
        </div>

        {/* Conversation Header */}
        <div className="p-4 border-b flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold">
            {selectedConversation?.otherUser?.charAt(0) || "L"}
          </div>
          <div>
            <p className="font-semibold text-gray-700">
              {selectedConversation?.otherUser || "Lisa K."}
            </p>
            <p className="text-xs text-gray-500">
              {selectedConversation?.itemName || "Kayak - Single"}
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-white">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "me" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                  msg.sender === "me"
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-br-sm"
                    : "bg-gray-100 text-gray-900 rounded-bl-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-4 border-t  flex items-center gap-2">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 text-gray-600 p-3 border border-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={handleSend}
            className="w-12 h-12 cursor-pointer rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
