"use client";

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

type Message = {
  id: string;
  body: string;
  createdAt: string;
  sender: { name: string | null; email: string };
  senderId: string;
};

export default function ClientSupportPage() {
  const params = useParams();
  const threadId = params.threadId as string;
  const [messages, setMessages] = useState<Message[]>([]);
  const [listing, setListing] = useState<any>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  async function loadMessages() {
    const res = await fetch(`/api/support/threads/${threadId}/messages`);
    if (!res.ok) return;
    const data = await res.json();
    setMessages(data.messages);
    setListing(data.listing);
  }

  useEffect(() => {
    fetch("/api/auth/session").then(r => r.json()).then(s => setCurrentUserId(s?.user?.id || ""));
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [threadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    setSending(true);
    await fetch(`/api/support/threads/${threadId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: input }),
    });
    setInput("");
    await loadMessages();
    setSending(false);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <Link href="/dashboard" className="font-bold text-blue-600 text-lg">AgentMarket</Link>
        <Link href="/creator/listings" className="text-sm text-gray-400 hover:text-gray-700">← My Listings</Link>
      </nav>

      <div className="max-w-2xl mx-auto w-full px-4 py-6 flex flex-col flex-1">
        <h1 className="text-lg font-bold text-gray-800 mb-1">Support</h1>
        {listing && <p className="text-sm text-gray-400 mb-4">Re: {listing.title}</p>}

        {/* Messages */}
        <div className="flex-1 bg-white rounded-2xl border shadow-sm p-4 space-y-3 overflow-y-auto max-h-[500px]">
          {messages.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">No messages yet. Start the conversation!</p>
          )}
          {messages.map((msg) => {
            const isMe = msg.senderId === currentUserId;
            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${isMe ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"}`}>
                  {!isMe && <p className="text-xs font-medium mb-1 opacity-70">{msg.sender.name || msg.sender.email}</p>}
                  <p>{msg.body}</p>
                  <p className={`text-xs mt-1 opacity-60`}>{new Date(msg.createdAt).toLocaleTimeString()}</p>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="flex gap-2 mt-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" disabled={sending}
            className="bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
