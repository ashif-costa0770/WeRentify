"use client";

import { useState } from 'react';
import { X, MapPin, Calendar, DollarSign, MessageSquare, Package, Wrench, Lightbulb } from 'lucide-react';

export default function MessageModal({ 
  isOpen, 
  onClose, 
  post 
}) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  if (!isOpen || !post) return null;

  const isService = post.type === "service";

  const quickResponses = [
    `Hi! Are you still in need of this ${isService ? 'service' : 'item'}?`,
    "Hi! I need more information."
  ];

  const handleQuickResponse = (text) => {
    setMessage(text);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setIsSending(true);
    // Simulate API call - replace with your actual message sending logic
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      console.log('Sending message to:', post.author, 'Message:', message);
      onClose();
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="px-6 py-3 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white font-semibold text-lg shadow-lg">
                {post.author?.charAt(0) || 'U'}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Message {post.author}</h2>
                <p className="text-sm text-gray-500 truncate max-w-[250px]">About: {post.title}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-gray-100 cursor-pointer rounded-full transition-colors duration-200 group"
            >
              <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600" />
            </button>
          </div>
        </div>

        {/* Listing Preview */}
        <div className="px-6 py-3 bg-gradient-to-r from-indigo-50/50 to-pink-50/50">
          <div className="flex items-center gap-3 p-3 bg-white/80 backdrop-blur rounded-xl border border-indigo-100 shadow-sm">
            <div className={`p-2 rounded-lg ${isService ? 'bg-orange-100' : 'bg-purple-100'}`}>
              {isService ? (
                <Wrench className="w-5 h-5 text-orange-600" />
              ) : (
                <Package className="w-5 h-5 text-purple-600" ></Package>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm truncate">{post.title}</h3>
              <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-red-500" />
                  {post.location}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  {post.dateNeeded}
                </span>
                <span className="flex items-center gap-1 font-medium text-green-600">
                  <DollarSign className="w-3 h-3" />
                  {post.budget}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Responses */}
        <div className="px-6 py-2">
          <div className="bg-blue-50/80 rounded-xl p-3 border border-blue-100">
            <div className="flex items-center  gap-2 mb-3">
              <Lightbulb className="w-4 h-4  text-amber-500" />
              <span className="text-sm font-semibold text-blue-900">Quick Responses:</span>
            </div>
            <div className="space-y-2">
              {quickResponses.map((response, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickResponse(response)}
                  className="w-full text-left cursor-pointer px-4 py-2.5 bg-white rounded-lg border border-blue-200 text-sm text-gray-700 hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-sm transition-all duration-200"
                >
                  {response}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Message Input */}
        <form onSubmit={handleSubmit} className="px-6 pb-6">
          <label className="block text-sm font-bold text-gray-900 mb-2">
            Your Message
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`Let ${post.author} know you have what they need...`}
            className="w-full h-28 px-4 py-3 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 placeholder:text-gray-400"
          />
          
          {/* Send Button */}
          <button
            type="submit"
            disabled={!message.trim() || isSending}
            className="w-full mt-4 py-3.5 cursor-pointer px-6 bg-gradient-to-r from-indigo-500 to-pink-500 hover:from-indigo-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            {isSending ? (
              <span>Sending...</span>
            ) : (
              <>
                Send Message
                <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}