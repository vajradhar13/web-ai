import React from 'react';

export default function Sidebar({ open, onToggle }: { open: boolean; onToggle: () => void }) {
  return (
    <aside className={`bg-neutral-800 h-full w-64 p-4 flex flex-col transition-transform duration-200 ${open ? '' : '-translate-x-full'} md:translate-x-0 md:static fixed z-20`}>
      {/* Collapse button for mobile */}
      <button className="md:hidden mb-4" onClick={onToggle}>
        {open ? 'Close' : 'Open'}
      </button>
      <div className="flex-1 overflow-y-auto">
        <h2 className="text-lg font-bold mb-4">Chats</h2>
        <ul className="space-y-2 mb-4">
          <li className="bg-neutral-700 rounded px-3 py-2 cursor-pointer">Chat 1</li>
          <li className="bg-neutral-700 rounded px-3 py-2 cursor-pointer">Chat 2</li>
        </ul>
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded mb-4">+ New Chat</button>
      </div>
      <button className="mt-auto bg-neutral-700 hover:bg-neutral-600 text-white py-2 rounded">Settings / Profile</button>
    </aside>
  );
} 