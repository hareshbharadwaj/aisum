import React, { useEffect, useRef } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { ChartBarIcon } from '../components/Icons';

declare global {
    interface Window {
        Chart: any;
    }
}

const PerformancePage: React.FC = () => {
    const { quizHistory, schedule } = useAppContext();
    const quizChartRef = useRef<HTMLCanvasElement>(null);
    const studyChartRef = useRef<HTMLCanvasElement>(null);
    const quizChartInstance = useRef<any>(null);
    const studyChartInstance = useRef<any>(null);

    // --- Quiz Performance Chart ---
    useEffect(() => {
        if (!quizChartRef.current || !window.Chart) return;
        if (quizChartInstance.current) {
            quizChartInstance.current.destroy();
        }

        const ctx = quizChartRef.current.getContext('2d');
        const labels = quizHistory.map(q => new Date(q.createdAt).toLocaleDateString());
        const data = quizHistory.map(q => q.percentage);

        quizChartInstance.current = new window.Chart(ctx, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Quiz Score (%)',
                    data,
                    backgroundColor: 'rgba(59, 130, 246, 0.5)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: (value: number) => `${value}%`
                        }
                    }
                },
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: (context: any) => `${context.dataset.label}: ${context.raw}%`
                        }
                    }
                }
            }
        });

    }, [quizHistory]);

    // --- Study Hours Chart ---
    useEffect(() => {
        if (!studyChartRef.current || !window.Chart) return;
        if (studyChartInstance.current) {
            studyChartInstance.current.destroy();
        }

        const studyData: { [key: string]: number } = schedule.reduce((acc, task) => {
            if (task.isCompleted) {
                acc[task.summaryTitle] = (acc[task.summaryTitle] || 0) + task.hours;
            }
            return acc;
        }, {} as { [key: string]: number });
        
        const labels = Object.keys(studyData);
        const data = Object.values(studyData);

        if(labels.length === 0) return;

        const ctx = studyChartRef.current.getContext('2d');
        studyChartInstance.current = new window.Chart(ctx, {
            type: 'pie',
            data: {
                labels,
                datasets: [{
                    label: 'Study Hours',
                    data,
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.7)',
                        'rgba(239, 68, 68, 0.7)',
                        'rgba(245, 158, 11, 0.7)',
                        'rgba(16, 185, 129, 0.7)',
                        'rgba(139, 92, 246, 0.7)',
                        'rgba(236, 72, 153, 0.7)',
                    ],
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                     tooltip: {
                        callbacks: {
                            label: (context: any) => ` ${context.label}: ${context.raw} hours`
                        }
                    }
                }
            }
        });
    }, [schedule]);


    const renderEmptyState = (title: string, message: string) => (
        <div className="text-center bg-white p-12 rounded-xl shadow-md border border-slate-200">
            <ChartBarIcon className="w-12 h-12 mx-auto text-slate-400" />
            <h2 className="mt-4 text-2xl font-semibold text-slate-700">{title}</h2>
            <p className="mt-2 text-slate-500">{message}</p>
        </div>
    );

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-800">Your Performance</h1>

            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Quiz Performance History</h2>
                {quizHistory.length > 0 ? (
                    <canvas ref={quizChartRef}></canvas>
                ) : (
                    <p className="text-slate-500 text-center py-8">No quiz history yet. Take a quiz to see your performance!</p>
                )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Completed Study Hours by Subject</h2>
                {schedule.some(t => t.isCompleted) ? (
                     <div className="max-w-md mx-auto">
                        <canvas ref={studyChartRef}></canvas>
                    </div>
                ) : (
                    <p className="text-slate-500 text-center py-8">No completed study tasks yet. Complete a task in your schedule to see the breakdown!</p>
                )}
            </div>

            {quizHistory.length === 0 && !schedule.some(t => t.isCompleted) &&
                renderEmptyState("No Performance Data", "Complete quizzes and study tasks to see your progress here.")
            }
        </div>
    );
};

export default PerformancePage;
