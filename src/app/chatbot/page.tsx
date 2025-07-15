"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bot, User } from "lucide-react";

function Avatar({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`inline-flex items-center justify-center rounded-full bg-neutral-800 text-white ${className}`}>{children}</span>
  );
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "👋 Hello! I'm your QA assistant. Ask me anything!" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { role: "user", text: input };
    setMessages((msgs) => [...msgs, userMessage]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch("/api/v1/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: input }),
      });
      const data = await res.json();
      setMessages((msgs) => [
        ...msgs,
        { role: "assistant", text: data.response || data.error || "No response" },
      ]);
    } catch (err) {
      setMessages((msgs) => [
        ...msgs,
        { role: "assistant", text: "Error: Could not get response." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) sendMessage();
  };

  return (
    <div className="flex flex-col items-center h-screen bg-black text-white">
      <div className="w-full max-w-2xl flex flex-col h-full">
        <header className="p-4 text-xl font-bold border-b border-neutral-800 flex justify-between items-center">
          <span>QA Chatbot</span>
          {/* Optionally add a new chat button here */}
        </header>
        <main className="flex-1 flex flex-col p-4 overflow-y-auto gap-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <Avatar className="h-8 w-8 mt-1 mr-2"><Bot className="h-5 w-5" /></Avatar>
              )}
              <div
                className={`max-w-xl px-4 py-2 rounded-lg mb-2 text-sm whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-neutral-800 text-right flex items-center gap-2" // user
                    : "bg-neutral-900" // assistant
                }`}
              >
                {msg.text}
              </div>
              {msg.role === "user" && (
                <Avatar className="h-8 w-8 mt-1 ml-2"><User className="h-5 w-5" /></Avatar>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex justify-start items-center">
              <Avatar className="h-8 w-8 mt-1 mr-2"><Bot className="h-5 w-5" /></Avatar>
              <div className="max-w-xl px-4 py-2 rounded-lg mb-2 bg-neutral-900 text-sm animate-pulse">
                Analysing...
              </div>
            </div>
          )}
        </main>
        <footer className="p-4 border-t border-neutral-800 flex gap-2 bg-black">
          <input
            className="flex-1 px-4 py-2 rounded bg-neutral-900 text-white outline-none border border-neutral-700"
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <Button onClick={sendMessage} disabled={loading || !input.trim()}>
            {loading ? "..." : "Send"}
          </Button>
        </footer>
      </div>
    </div>
  );
} 