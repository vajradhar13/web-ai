'use client'
import ChatPanel from './ChatPanel';

export default function UnifiedAssistantLayout() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-neutral-900 text-white px-2 py-8">
      <div className="w-full max-w-2xl mx-auto flex flex-col justify-between items-center min-h-[80vh] border-l border-r border-white/10 rounded-none md:rounded-2xl bg-[#18181b]/80 shadow-lg p-0 md:p-8" style={{ boxShadow: '0 2px 16px 0 rgba(0,0,0,0.18)' }}>
        <div className="flex-1 w-full flex flex-col gap-8 justify-start items-center pt-8 md:pt-0">
          <ChatPanel />
        </div>
      </div>
    </div>
  );
} 