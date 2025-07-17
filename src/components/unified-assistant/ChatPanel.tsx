import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUploadThing } from '@/utils/uploadthing';
import { Bot, User } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

type Mode = 'chat' | 'summarize' | 'qa';

function detectMode(input: string, file: File | null): { mode: Mode; cleanText: string; allowed: boolean } {
  const trimmed = input.trim();
  if (trimmed.startsWith('/summarize')) {
    return { mode: 'summarize', cleanText: trimmed.replace(/^\/summarize\s*/, ''), allowed: !!file };
  }
  if (trimmed.startsWith('/qa')) {
    return { mode: 'qa', cleanText: trimmed.replace(/^\/qa\s*/, ''), allowed: !!file };
  }
  return { mode: 'chat', cleanText: trimmed, allowed: true };
}

export default function ChatPanel({ onSidebarToggle }: { onSidebarToggle: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'How can I help you today? (Try /summarize or /qa with a document!)' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { startUpload } = useUploadThing('pdfUploader', {
    onClientUploadComplete: () => {},
    onUploadError: () => setError('File upload failed'),
    onUploadBegin: () => {},
  });

  const handleSend = async () => {
    if (!input.trim()) return;
    setError(null);
    const { mode, cleanText, allowed } = detectMode(input, file);
    if (!allowed) {
      setError('You must upload a file to use /summarize or /qa.');
      return;
    }
    const userMsg: Message = { role: 'user', text: input };
    setMessages((msgs) => [...msgs, userMsg]);
    setInput('');
    setLoading(true);

    let uploadedFileUrl = fileUrl;
    if (file && !fileUrl) {
      try {
        const resp = await startUpload([file]);
        if (!resp || !resp[0]) throw new Error('File upload failed');
        uploadedFileUrl = resp[0].serverData?.fileUrl || resp[0].url;
        setFileUrl(uploadedFileUrl);
      } catch {
        setError('File upload failed');
        setLoading(false);
        return;
      }
    }

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText, fileUrl: uploadedFileUrl, mode }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages((msgs) => [
          ...msgs,
          { role: 'assistant', text: `Error: ${data.error}` },
        ]);
      } else {
        setMessages((msgs) => [
          ...msgs,
          { role: 'assistant', text: data.output || data.summary || data.answer || 'No response' },
        ]);
      }
    } catch {
      setMessages((msgs) => [
        ...msgs,
        { role: 'assistant', text: 'Error: Could not reach backend.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !loading) handleSend();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setFileUrl(null);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-16 flex items-center px-4 border-b border-neutral-800">
        <button className="md:hidden mr-2" onClick={onSidebarToggle}>
          ☰
        </button>
        <span className="font-bold text-lg">Chat Title</span>
      </div>
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-neutral-900 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-start`}>
            {msg.role === 'assistant' && (
              <span className="inline-flex items-center justify-center rounded-full bg-neutral-800 text-white h-8 w-8 mt-1 mr-2">
                <Bot className="h-5 w-5" />
              </span>
            )}
            <div className={`max-w-lg px-4 py-2 rounded-lg text-sm whitespace-pre-line shadow ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-white'}`}>
              {msg.text}
            </div>
            {msg.role === 'user' && (
              <span className="inline-flex items-center justify-center rounded-full bg-blue-600 text-white h-8 w-8 mt-1 ml-2">
                <User className="h-5 w-5" />
              </span>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="max-w-lg px-4 py-2 rounded-lg text-sm bg-neutral-800 text-white shadow animate-pulse">
              Thinking...
            </div>
          </div>
        )}
        {error && (
          <div className="flex justify-center">
            <div className="max-w-lg px-4 py-2 rounded-lg text-sm bg-red-700 text-white shadow">
              {error}
            </div>
          </div>
        )}
      </div>
      {/* Quick Actions */}
      <div className="p-2 border-t border-neutral-800 bg-neutral-900">
        <Button variant="secondary" className="mr-2" onClick={() => setInput('/summarize ')}>Summarize this chat →</Button>
        <Button variant="secondary" onClick={() => setInput('/qa ')}>Ask Document →</Button>
      </div>
      {/* Input */}
      <div className="p-4 border-t border-neutral-800 bg-neutral-900 flex gap-2 items-center">
        <Button variant="outline" type="button" onClick={() => fileInputRef.current?.click()}>
          📎
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />
        <Input
          className="flex-1"
          placeholder="Type a message or /summarize, /qa..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />
        <Button onClick={handleSend} disabled={loading || !input.trim()}>
          Send
        </Button>
      </div>
      {/* File attached info */}
      {file && <div className="p-2 text-xs text-green-400">File attached: {file.name}</div>}
    </div>
  );
} 