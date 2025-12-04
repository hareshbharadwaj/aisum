import React, { useState, useRef, useEffect, FormEvent } from 'react';
import { PaperAirplaneIcon } from './Icons';
import { answerQuestionFromNotes, chatWithAssistant } from '../services/geminiService';

interface ChatPanelProps {
  summary?: { summaryContent?: string } | null;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ summary }) => {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'model'; content: string }>>([]);
  const [question, setQuestion] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [askError, setAskError] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, isAsking]);

    const handleAskQuestion = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed) return;
    const newMessages = [...messages, { role: 'user', content: trimmed }];
    setMessages(newMessages);
    setQuestion('');
    setIsAsking(true);
    setAskError('');
    try {
        // Show typing animation until we receive the full response
        setIsTyping(true);
        const resp = summary?.summaryContent ? await answerQuestionFromNotes(trimmed, summary?.summaryContent || '', '') : await chatWithAssistant(trimmed);
        setMessages(prev => [...prev, { role: 'model', content: resp }]);
    } catch (err: any) {
      setAskError(err.message || 'Failed to get an answer');
      setMessages(prev => [...prev, { role: 'model', content: "Sorry, I couldn't get an answer." }]);
    } finally {
        setIsTyping(false);
        setIsAsking(false);
    }
  };

  return (
    <div className="h-64 flex flex-col">
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map((msg, i) => (
          <div key={i} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-sky-500 flex-shrink-0"></div>}
            <div className={`max-w-xs px-4 py-2.5 rounded-2xl ${msg.role === 'user' ? 'bg-sky-600 text-white rounded-br-lg' : 'bg-white text-slate-700 rounded-bl-lg'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-sky-500 flex-shrink-0"></div>
            <div className="max-w-xs px-4 py-2.5 rounded-2xl bg-white text-slate-700 rounded-bl-lg">
              <div className="flex items-center space-x-2">
                <span className="text-sm">Typing</span>
                <div className="flex space-x-1">
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-75"></span>
                  <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse delay-150"></span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <form onSubmit={handleAskQuestion} className="p-4 border-t border-slate-200 bg-white">
        <div className="flex items-center space-x-2">
          <input 
            type="text"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            placeholder={summary ? 'Ask about the summary...' : 'Open a summary to ask questions'}
            className="flex-1 w-full px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-sky-500 focus:border-sky-500"
            disabled={!summary || isAsking}
          />
          <button
            type="submit"
            disabled={isAsking || !question.trim() || !summary}
            className="p-2.5 bg-sky-600 text-white rounded-lg disabled:bg-sky-300 disabled:cursor-not-allowed"
          >
            <PaperAirplaneIcon className="w-5 h-5" />
          </button>
        </div>
        {askError && <p className="mt-2 text-xs text-red-600">{askError}</p>}
      </form>
    </div>
  );
};

export default ChatPanel;
