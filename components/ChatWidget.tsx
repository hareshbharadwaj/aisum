import React, { useState, useRef, useEffect } from 'react';
import { XIcon } from './Icons';
import ChatPanel from './ChatPanel';

interface ChatWidgetProps {
  summary?: { id?: string; title?: string; summaryContent?: string } | null;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ summary }) => {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen(o => !o);

  return (
    <div>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!open && (
          <button onClick={toggle} className="w-14 h-14 rounded-full bg-sky-600 text-white shadow-lg flex items-center justify-center hover:scale-105 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8-1.453 0-2.82-.27-4.03-.746L3 20l1.125-2.955C3.487 15.98 3 14.55 3 13c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        )}

        {open && (
          <div className="w-80 max-w-sm h-96 bg-white rounded-2xl shadow-xl flex flex-col overflow-hidden">
            <div className="flex items-center justify-between p-3 bg-sky-600 text-white">
              <div className="text-sm font-semibold">AI Assistant</div>
              <div className="flex items-center gap-2">
                <button onClick={toggle} className="p-1 rounded-md hover:bg-sky-500"><XIcon className="w-4 h-4" /></button>
              </div>
            </div>
            <ChatPanel summary={summary} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWidget;
