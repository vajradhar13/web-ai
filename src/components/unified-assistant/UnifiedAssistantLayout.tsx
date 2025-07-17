'use client'
import { useState } from 'react';
import Sidebar from './Sidebar';
import ChatPanel from './ChatPanel';

export default function UnifiedAssistantLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  return (
    <div className="flex h-screen w-screen bg-neutral-900 text-white">
      {/* Sidebar (collapsible) */}
      <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen((v) => !v)} />
      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        <ChatPanel onSidebarToggle={() => setSidebarOpen((v) => !v)} />
      </div>
    </div>
  );
} 