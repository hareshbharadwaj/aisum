import React, { useState } from 'react';
import { Summary } from '../types';
import { XIcon, ChevronUpIcon, ChevronDownIcon } from './Icons';
import FormattedContent from './FormattedContent';
import ChatPanel from './ChatPanel';

interface SummaryDetailModalProps {
    summary: Summary;
    onClose: () => void;
}

const SummaryDetailModal: React.FC<SummaryDetailModalProps> = ({ summary, onClose }) => {
    const [isChatOpen, setIsChatOpen] = useState(false);

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4 transition-opacity duration-300"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col relative overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                {/* Main Content Area - scrollable */}
                <div className="flex-1 flex flex-col min-h-0">
                    {/* Header */}
                    <div className="flex justify-between items-center p-6 border-b border-slate-200 flex-shrink-0">
                        <h2 className="text-2xl font-bold text-slate-800 truncate" title={summary.title}>{summary.title}</h2>
                        <button onClick={onClose} className="p-2 rounded-full text-slate-500 hover:bg-slate-100">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content Viewer */}
                    <div className="flex-1 overflow-y-auto p-6 min-h-0">
                        <div className="border-b border-slate-200 mb-6">
                            <h3 className="text-sm font-medium text-slate-600">AI Summary</h3>
                        </div>
                        <div>
                            <FormattedContent content={summary.summaryContent} />
                        </div>
                    </div>
                </div>

                {/* Bottom-docked Chat Panel with toggle */}
                <div className="flex-shrink-0 border-t border-slate-200 bg-slate-50">
                    <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200">
                        <h3 className="font-bold text-slate-800">AI Study Assistant</h3>
                        <button
                            onClick={() => setIsChatOpen(o => !o)}
                            className="p-2 rounded-md hover:bg-slate-100 text-slate-600"
                            aria-label={isChatOpen ? 'Collapse AI assistant' : 'Expand AI assistant'}
                        >
                            {isChatOpen ? <ChevronDownIcon className="w-5 h-5" /> : <ChevronUpIcon className="w-5 h-5" />}
                        </button>
                    </div>
                    {isChatOpen && (
                        <ChatPanel summary={{ summaryContent: summary.summaryContent }} />
                    )}
                </div>
            </div>
        </div>
    );
};

export default SummaryDetailModal;