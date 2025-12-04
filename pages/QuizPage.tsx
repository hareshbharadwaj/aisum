import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { generateQuiz } from '../services/geminiService';
import { QuizQuestion, QuizHistory } from '../types';
import Spinner from '../components/Spinner';

const QuizPage: React.FC = () => {
    const { summaries, addQuizResult } = useAppContext();
    const [quiz, setQuiz] = useState<QuizQuestion[] | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [userAnswers, setUserAnswers] = useState<(string | null)[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedSummaryId, setSelectedSummaryId] = useState<string>('');

    const selectedSummary = summaries.find(s => s.id === selectedSummaryId);

    const handleGenerateQuiz = async () => {
        if (!selectedSummary) {
            setError('Please select a summary to be quizzed on.');
            return;
        }
        setIsLoading(true);
        setError('');
        setQuiz(null);
        setUserAnswers([]);
        setShowResults(false);
        try {
            const newQuiz = await generateQuiz(selectedSummary.summaryContent, selectedSummary.originalContent);
            if (newQuiz.length === 0) {
                setError("The AI couldn't generate a quiz from this content. Please try another summary.");
                setQuiz(null);
            } else {
                setQuiz(newQuiz);
                setUserAnswers(new Array(newQuiz.length).fill(null));
            }
        } catch (err: any) {
            setError(err.message || 'Failed to generate quiz.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAnswerSelect = (questionIndex: number, option: string) => {
        if (showResults) return;
        const newAnswers = [...userAnswers];
        newAnswers[questionIndex] = option;
        setUserAnswers(newAnswers);
    };
    
    const handleSubmit = () => {
        setShowResults(true);
        if(!quiz || !selectedSummary) return;

        const score = calculateScore();
        const totalQuestions = quiz.length;
        const percentage = Math.round((score / totalQuestions) * 100);

        const newResult: QuizHistory = {
            id: new Date().toISOString(),
            summaryTitle: selectedSummary.title,
            score,
            totalQuestions,
            percentage,
            createdAt: new Date().toISOString()
        };
        addQuizResult(newResult);
    };

    const getOptionClass = (questionIndex: number, option: string) => {
        if (!showResults || !quiz) {
            return "bg-white hover:bg-slate-100";
        }
        const correctAnswer = quiz[questionIndex].correctAnswer;
        const userAnswer = userAnswers[questionIndex];
        if (option === correctAnswer) {
            return "bg-green-100 border-green-500 text-green-800 font-semibold";
        }
        if (option === userAnswer && option !== correctAnswer) {
            return "bg-red-100 border-red-500 text-red-800";
        }
        return "bg-slate-50 text-slate-500";
    };
    
    const calculateScore = () => {
        if (!quiz) return 0;
        return userAnswers.reduce((score, answer, index) => {
            return answer === quiz[index].correctAnswer ? score + 1 : score;
        }, 0);
    };

    if (summaries.length === 0) {
        return (
            <div className="text-center bg-white p-12 rounded-xl shadow-md border border-slate-200">
                <h2 className="text-2xl font-semibold text-slate-700">Ready for a Quiz?</h2>
                <p className="mt-2 text-slate-500">First, upload some notes and generate a summary. The quiz will be based on your latest summary.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-800">Knowledge Check</h1>
            
             <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="md:col-span-2">
                        <label htmlFor="summary-select" className="block text-sm font-medium text-slate-700">Select summary to be quizzed on</label>
                        <select
                            id="summary-select"
                            value={selectedSummaryId}
                            onChange={e => {
                                setSelectedSummaryId(e.target.value);
                                setQuiz(null); // Clear old quiz on new selection
                                setShowResults(false);
                                setError('');
                            }}
                            className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-slate-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"
                        >
                            <option value="" disabled>Choose a summary...</option>
                            {summaries.map(s => (
                                <option key={s.id} value={s.id}>{s.title}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={handleGenerateQuiz}
                        disabled={isLoading || !selectedSummaryId}
                        className="flex items-center justify-center w-full px-6 py-2.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-300"
                    >
                        {isLoading ? <Spinner /> : 'Generate Quiz'}
                    </button>
                </div>
            </div>

            {error && <div className="bg-red-100 text-red-700 p-4 rounded-lg">{error}</div>}
            
            {isLoading && (
                 <div className="text-center bg-white p-12 rounded-xl shadow-md border border-slate-200">
                    <Spinner />
                    <p className="mt-4 text-slate-500">Generating your quiz...</p>
                </div>
            )}
            
            {quiz && (
                <div className="space-y-8">
                    {quiz.map((q, qIndex) => (
                        <div key={qIndex} className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                            <p className="font-semibold text-slate-800">{qIndex + 1}. {q.question}</p>
                            <div className="mt-4 space-y-3">
                                {q.options.map((option, oIndex) => (
                                    <button
                                        key={oIndex}
                                        onClick={() => handleAnswerSelect(qIndex, option)}
                                        disabled={showResults}
                                        className={`w-full text-left p-3 border rounded-lg transition-colors ${
                                            userAnswers[qIndex] === option && !showResults ? 'ring-2 ring-sky-500 bg-sky-50' : ''
                                        } ${getOptionClass(qIndex, option)}`}
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                            {showResults && userAnswers[qIndex] !== q.correctAnswer && (
                                <div className="mt-4 p-4 bg-amber-50 border-l-4 border-amber-400 rounded-r-lg">
                                    <h4 className="font-semibold text-amber-800">Explanation</h4>
                                    <p className="mt-1 text-amber-700">{q.explanation}</p>
                                </div>
                            )}
                        </div>
                    ))}
                     <div className="text-center">
                         {!showResults ? (
                            <button
                                onClick={handleSubmit}
                                className="px-8 py-3 bg-emerald-600 text-white font-semibold rounded-lg shadow-md hover:bg-emerald-700"
                            >
                                Submit & See Results
                            </button>
                         ) : (
                             <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
                                 <h2 className="text-2xl font-bold text-slate-800">Quiz Complete!</h2>
                                 <p className="mt-2 text-3xl font-extrabold text-sky-600">
                                     You scored {calculateScore()} out of {quiz.length}
                                 </p>
                             </div>
                         )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizPage;