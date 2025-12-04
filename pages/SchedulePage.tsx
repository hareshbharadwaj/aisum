
import React, { useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import * as StorageService from '../services/storageService';
import { StudyTask } from '../types';

const SchedulePage: React.FC = () => {
    const { summaries, schedule, setSchedule, updateTask, user } = useAppContext();
    const [selectedSummary, setSelectedSummary] = useState<string>('');
    const [studyHours, setStudyHours] = useState<number>(1);

    const handleAddTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSummary || !user) return;

        const summary = summaries.find(s => s.id === selectedSummary);
        if (!summary) return;

        const newTask: StudyTask = {
            id: new Date().toISOString(),
            summaryId: summary.id,
            summaryTitle: summary.title,
            hours: studyHours,
            isCompleted: false,
        };

        const newSchedule = [...schedule, newTask];
        setSchedule(newSchedule);
        StorageService.saveSchedule(user.email, newSchedule);
        setSelectedSummary('');
        setStudyHours(1);
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-slate-800">Study Schedule</h1>

            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Add a New Study Task</h2>
                {summaries.length > 0 ? (
                    <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div className="md:col-span-1">
                            <label htmlFor="summary-select" className="block text-sm font-medium text-slate-700">Select Summary</label>
                            <select
                                id="summary-select"
                                value={selectedSummary}
                                onChange={e => setSelectedSummary(e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-slate-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"
                            >
                                <option value="" disabled>Choose a summary...</option>
                                {summaries.map(s => (
                                    <option key={s.id} value={s.id}>{s.title}</option>
                                ))}
                            </select>
                        </div>
                         <div>
                            <label htmlFor="study-hours" className="block text-sm font-medium text-slate-700">Study Hours</label>
                            <input
                                type="number"
                                id="study-hours"
                                value={studyHours}
                                onChange={e => setStudyHours(Number(e.target.value))}
                                min="1"
                                className="mt-1 block w-full pl-3 pr-3 py-2 border-slate-300 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm rounded-md"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!selectedSummary}
                            className="w-full justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:bg-sky-300"
                        >
                            Add Task
                        </button>
                    </form>
                ) : (
                    <p className="text-slate-500">You need to create a summary before you can add a study task.</p>
                )}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">Your Tasks</h2>
                {schedule.length > 0 ? (
                    <ul className="divide-y divide-slate-200">
                        {schedule.map(task => (
                            <li key={task.id} className="py-4 flex items-center justify-between">
                                <div className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={task.isCompleted}
                                        onChange={e => updateTask(task.id, e.target.checked)}
                                        className="h-5 w-5 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                                    />
                                    <div className="ml-4">
                                        <p className={`text-base font-medium ${task.isCompleted ? 'text-slate-500 line-through' : 'text-slate-900'}`}>{task.summaryTitle}</p>
                                        <p className={`text-sm ${task.isCompleted ? 'text-slate-400' : 'text-slate-600'}`}>{task.hours} hour(s)</p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-slate-500 text-center py-8">Your schedule is empty. Add a task to get started!</p>
                )}
            </div>
        </div>
    );
};

export default SchedulePage;
