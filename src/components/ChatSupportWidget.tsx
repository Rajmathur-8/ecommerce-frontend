'use client';

import { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';
import ChatSupport from './ChatSupport';

export default function ChatSupportWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center group cursor-pointer"
        aria-label="Open chat support"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Chat Support Component */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-3rem)] h-[500px] bg-white rounded-lg shadow-2xl flex flex-col overflow-hidden">
          <ChatSupport onClose={() => setIsOpen(false)} />
        </div>
      )}
    </>
  );
}

