import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { Summary } from '../types';
import SummaryDetailModal from '../components/SummaryDetailModal';
import { BookOpenIcon } from '../components/Icons';

const SummariesPage: React.FC = () => {
    const { summaries, setPage } = useAppContext();
    const [selectedSummary, setSelectedSummary] = useState<Summary | null>(null);

    const sortedSummaries = [...summaries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    if (summaries.length === 0) {
        return (
            <div className="text-center bg-white p-12 rounded-xl shadow-md border border-slate-200">
                <BookOpenIcon className="w-12 h-12 mx-auto text-slate-400" />
                <h2 className="mt-4 text-2xl font-semibold text-slate-700">No Summaries Yet</h2>
                <p className="mt-2 text-slate-500">You haven't generated any summaries. Upload some notes to get started.</p>
                <button 
                    onClick={() => setPage('UPLOAD')}
                    className="mt-6 px-6 py-2.5 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-colors"
                >
                    Upload Notes
                </button>
            </div>
        );
    }
    
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">Your Summaries</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedSummaries.map(summary => (
                    <div 
                        key={summary.id} 
                        onClick={() => setSelectedSummary(summary)}
                        className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-slate-200"
                    >
                        <h3 className="text-lg font-semibold text-slate-800 truncate">{summary.title}</h3>
                        <p className="mt-2 text-sm text-slate-500 line-clamp-3">{summary.summaryContent}</p>
                        <p className="mt-4 text-xs text-slate-400">
                            {new Date(summary.createdAt).toLocaleDateString()}
                        </p>
                    </div>
                ))}
            </div>

            {selectedSummary && (
                <SummaryDetailModal 
                    summary={selectedSummary} 
                    onClose={() => setSelectedSummary(null)} 
                />
            )}

            {/* Chat widget removed: assistant is available inside the summary modal only */}
        </div>
    );
};

export default SummariesPage;
