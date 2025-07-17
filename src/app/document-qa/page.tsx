// src/app/document-qa/page.tsx
"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Bot, User } from "lucide-react";
import { useUploadThing } from "@/utils/uploadthing";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { startUpload } = useUploadThing("pdfUploader", {
    onClientUploadComplete: () => {},
    onUploadError: () => {
      setError("Something went wrong during upload");
    },
    onUploadBegin: () => {},
  });

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setError("");
    setExtractedText(null);
    try {
      const resp = await startUpload([file]);
      if (!resp || !resp[0]) {
        setError("File upload failed");
        setLoading(false);
        return;
      }
      const fileUrl = resp[0].serverData?.fileUrl || resp[0].url;
      if (!fileUrl) {
        setError("File URL missing after upload");
        setLoading(false);
        return;
      }
      const extractResp = await fetch("/api/extract-pdf-text", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileUrl }),
      });
      const extractData = await extractResp.json();
      if (!extractData.pdfText || extractData.pdfText.trim().length < 20) {
        setError(extractData.error || "Failed to extract PDF text");
        setLoading(false);
        return;
      }
      setExtractedText(extractData.pdfText);
      setMessages([
        { role: "assistant", text: "Document uploaded and processed! Now ask your questions about its content." },
      ]);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch {
      setError("Could not process the document.");
    } finally {
      setLoading(false);
    }
  };

  const sendQuestion = async () => {
    if (!input.trim() || !extractedText) {
      setError("Please upload a PDF and provide a question.");
      return;
    }
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
      const qaResp = await fetch("/api/v1/document-qa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: extractedText, question: userMessage.text }),
      });
      const qaData = await qaResp.json();
      setLoading(false);
      if (qaData.error) {
        setError(qaData.error);
        setMessages((msgs) => [
          ...msgs,
          { role: "assistant", text: `Error: ${qaData.error}` },
        ]);
      } else {
        setMessages((msgs) => [
          ...msgs,
          { role: "assistant", text: qaData.output || "No response" },
        ]);
      }
    } catch {
      setLoading(false);
      setError("Could not process the document.");
      setMessages((msgs) => [...msgs, { role: "assistant", text: `Error: Could not process the document.` }]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !loading && extractedText) {
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
              accept="application/pdf"
              className="flex-1 text-white bg-neutral-900 border border-neutral-700 rounded px-2 py-1"
              onChange={(e) => {
                const selectedFile = e.target.files?.[0] || null;
                if (selectedFile) {
                  handleFileUpload(selectedFile);
                }
              }}
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
              placeholder={extractedText ? "Ask a question about the document..." : "Upload a PDF to begin..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading || !extractedText}
            />
            <Button onClick={sendQuestion} disabled={loading || !input.trim() || !extractedText}>
              {loading ? "..." : "Send"}
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
}