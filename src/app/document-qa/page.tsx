// src/app/document-qa/page.tsx
"use client";

import { useState, useRef } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Bot, User } from "lucide-react";

function Avatar({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-neutral-800 text-white ${className}`}
    >
      {children}
    </span>
  );
}

export default function DocumentQAPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Upload a text-based PDF document and ask a question about its content!" },
  ]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sendQuestion = async () => {
    if (!input.trim() || !file) {
      setError("Please provide both a PDF file and a question.");
      return;
    }

    // Validate file size (e.g., max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB. Please upload a smaller PDF.");
      return;
    }

    // Validate question length (e.g., max 500 characters)
    if (input.length > 500) {
      setError("Question is too long. Please keep it under 500 characters.");
      return;
    }

    const userMessage = { role: "user", text: input };
    setMessages((msgs) => [...msgs, userMessage]);
    setInput("");
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("question", input);

      const res = await axios.post("/api/v1/document-qa", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.error) {
        setError(res.data.error);
        setMessages((msgs) => [
          ...msgs,
          { role: "assistant", text: `Error: ${res.data.error}` },
        ]);
      } else {
        setMessages((msgs) => [...msgs, { role: "assistant", text: res.data.output || "No response" }]);
        // Clear file input after successful submission
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || "Could not process the document.";
      setError(errorMessage);
      setMessages((msgs) => [...msgs, { role: "assistant", text: `Error: ${errorMessage}` }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading) {
      sendQuestion();
    }
  };

  return (
    <div className="flex flex-col items-center h-screen bg-black text-white">
      <div className="w-full max-w-2xl flex flex-col h-full">
        <header className="p-4 text-xl font-bold border-b border-neutral-800 flex justify-between items-center">
          <span>Document-based QA</span>
        </header>
        <main className="flex-1 flex flex-col p-4 overflow-y-auto gap-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <Avatar className="h-8 w-8 mt-1 mr-2">
                  <Bot className="h-5 w-5" />
                </Avatar>
              )}
              <div
                className={`max-w-xl px-4 py-2 rounded-lg mb-2 text-sm whitespace-pre-line ${
                  msg.role === "user"
                    ? "bg-neutral-800 text-right flex items-center gap-2"
                    : "bg-neutral-900"
                }`}
              >
                {msg.text}
              </div>
              {msg.role === "user" && (
                <Avatar className="h-8 w-8 mt-1 ml-2">
                  <User className="h-5 w-5" />
                </Avatar>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex justify-start items-center">
              <Avatar className="h-8 w-8 mt-1 mr-2">
                <Bot className="h-5 w-5" />
              </Avatar>
              <div className="max-w-xl px-4 py-2 rounded-lg mb-2 bg-neutral-900 text-sm animate-pulse">
                Processing document...
              </div>
            </div>
          )}
        </main>
        <footer className="p-4 border-t border-neutral-800 flex flex-col gap-2 bg-black">
          {error && (
            <div className="text-red-500 text-sm mb-2">{error}</div>
          )}
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="application/pdf" // Restrict to PDFs
              className="flex-1 text-white bg-neutral-900 border border-neutral-700 rounded px-2 py-1"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={loading}
            />
            <Button
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
            >
              Upload
            </Button>
          </div>
          <div className="flex gap-2 mt-2">
            <input
              className="flex-1 px-4 py-2 rounded bg-neutral-900 text-white outline-none border border-neutral-700"
              type="text"
              placeholder="Ask a question about the document..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading || !file}
            />
            <Button onClick={sendQuestion} disabled={loading || !input.trim() || !file}>
              {loading ? "..." : "Send"}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}