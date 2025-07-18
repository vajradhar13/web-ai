import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUploadThing } from '@/utils/uploadthing';
import { Bot, User } from 'lucide-react';
import { Loader2, ArrowUp, X } from 'lucide-react';

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

export default function ChatPanel() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', text: 'How can I help you today? (Try /summarize or /qa with a document!)' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const [extractingTextLoading, setExtractingTextLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { startUpload } = useUploadThing('pdfUploader', {
    onClientUploadComplete: () => {},
    onUploadError: () => setError('File upload failed'),
    onUploadBegin: () => {},
  });
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim()) return;
    setError(null);
    const { mode, cleanText, allowed } = detectMode(input, file);
    if (!allowed) {
      setError('You must upload a file to use /summarize or /qa.');
      return;
    }
    if ((mode === 'qa' || mode === 'summarize') && (!extractedText || extractingTextLoading)) {
      setError('Please wait until the document is fully processed.');
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

    // If QA mode, extract PDF text if not already done
    let pdfText = extractedText;
    if (mode === 'qa') {
      if (!uploadedFileUrl) {
        setError('No file uploaded for QA.');
        setLoading(false);
        return;
      }
      if (!pdfText) {
        try {
          const extractResp = await fetch('/api/extract-pdf-text', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ fileUrl: uploadedFileUrl }),
          });
          const extractData = await extractResp.json();
          if (!extractData.pdfText || extractData.pdfText.trim().length < 20) {
            setError(extractData.error || 'Failed to extract PDF text');
            setLoading(false);
            return;
          }
          pdfText = extractData.pdfText;
          setExtractedText(pdfText);
        } catch {
          setError('Could not extract PDF text.');
          setLoading(false);
          return;
        }
      }
    }

    try {
      type AssistantBody =
        | { text: string; question: string; mode: 'qa' }
        | { text: string; mode: 'summarize' }
        | { text: string; mode: 'chat' };
      let body: AssistantBody;
      if (mode === 'qa') {
        body = { text: pdfText || '', question: cleanText, mode: 'qa' };
      } else if (mode === 'summarize') {
        body = { text: pdfText || '', mode: 'summarize' };
      } else {
        body = { text: cleanText, mode: 'chat' };
      }
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] || null;
    setFile(f);
    setFileUrl(null);
    setExtractedText(null); // Reset extracted text when new file is chosen
    if (f) {
      setExtractingTextLoading(true);
      setError(null);
      try {
        // Upload the file
        const resp = await startUpload([f]);
        if (!resp || !resp[0]) throw new Error('File upload failed');
        const uploadedFileUrl = resp[0].serverData?.fileUrl || resp[0].url;
        setFileUrl(uploadedFileUrl);
        // Extract PDF text
        const extractResp = await fetch('/api/extract-pdf-text', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fileUrl: uploadedFileUrl }),
        });
        const extractData = await extractResp.json();
        if (!extractData.pdfText || extractData.pdfText.trim().length < 20) {
          setError(extractData.error || 'Failed to extract PDF text');
          setExtractingTextLoading(false);
          return;
        }
        setExtractedText(extractData.pdfText);
      } catch {
        setError('Could not extract PDF text.');
      } finally {
        setExtractingTextLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col h-full min-h-[70vh] justify-between">
      {/* Header removed for sidebar-less view */}
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-transparent space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-start`}>
            {msg.role === 'assistant' && (
              <span className="inline-flex items-center justify-center rounded-full bg-neutral-800 text-white h-8 w-8 mt-1 mr-2">
                <Bot className="h-5 w-5" />
              </span>
            )}
            <div
              className={`max-w-lg px-4 py-2 rounded-lg text-sm whitespace-pre-line shadow
                ${msg.role === 'user'
                  ? 'bg-blue-600 text-white rounded-xl border border-blue-400'
                  : 'bg-neutral-800 text-white rounded-xl border border-neutral-700'}
              `}
            >
              {msg.text}
            </div>
            {msg.role === 'user' && (
              <span className="inline-flex items-center justify-center rounded-full bg-blue-600 text-white h-8 w-8 mt-1 ml-2">
                <User className="h-5 w-5" />
              </span>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
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
      <div className="flex flex-col gap-2 w-full mt-4">
        {/* Quick Actions */}
        <div className="w-full flex flex-col sm:flex-row gap-2 px-4 pb-2 pt-2 bg-transparent">
          <Button
            variant="secondary"
            className="flex-1 min-w-[160px] rounded-lg shadow-md text-base font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => setInput('/summarize ')}
            disabled={!extractedText || extractingTextLoading}
          >
            Summarize this chat <span className="ml-1">→</span>
          </Button>
          <Button
            variant="secondary"
            className="flex-1 min-w-[160px] rounded-lg shadow-md text-base font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => setInput('/qa ')}
            disabled={!extractedText || extractingTextLoading}
          >
            Ask Document <span className="ml-1">→</span>
          </Button>
        </div>
        {/* Input */}
        <div className="p-4 border-t border-neutral-800 bg-transparent flex flex-col gap-1 items-stretch">
          <div className="flex gap-2 items-center">
            <Button variant="outline" type="button" onClick={() => fileInputRef.current?.click()} disabled={!!extractingTextLoading}>
              📎
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              onChange={handleFileChange}
              disabled={!!extractingTextLoading}
            />
            <Input
              className="flex-1"
              placeholder={extractingTextLoading ? 'Processing document...' : 'Type a message or /summarize, /qa...'}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={!!loading || !!extractingTextLoading || (!!file && !extractedText)}
            />
            <Button
              onClick={handleSend}
              disabled={!!loading || !!extractingTextLoading || !input.trim() || (!!file && !extractedText)}
              size="icon"
              className={`transition-colors bg-white text-black rounded-full hover:bg-neutral-200 focus:bg-neutral-300 ${loading ? 'pointer-events-none' : ''}`}
              style={{ minWidth: 40, minHeight: 40 }}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin text-black" />
              ) : (
                <ArrowUp className="h-5 w-5 text-black" />
              )}
            </Button>
          </div>
          {/* File attached and document status */}
          {file && (
            <div className="flex items-center gap-2 mt-1 px-2 py-1 bg-neutral-800 rounded-md border border-neutral-700 w-fit min-w-[120px] max-w-[80vw] text-xs text-green-400">
              <span className="truncate" title={file.name}>File attached: {file.name}</span>
              <button
                className="ml-1 p-0.5 rounded hover:bg-neutral-700 transition"
                aria-label="Remove file"
                onClick={() => {
                  setFile(null);
                  setFileUrl(null);
                  setExtractedText(null);
                }}
                type="button"
              >
                <X className="h-4 w-4 text-red-400" />
              </button>
              {extractingTextLoading && (
                <span className="flex items-center gap-1 text-xs text-neutral-300 animate-pulse ml-2">
                  <Loader2 className="h-3 w-3 animate-spin" />
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 