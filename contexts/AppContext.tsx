import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode } from 'react';
import { User, Summary, StudyTask, QuizHistory } from '../types';
import * as StorageService from '../services/storageService';

type Page = 'DASHBOARD' | 'UPLOAD' | 'SUMMARIES' | 'QUIZ' | 'SCHEDULE' | 'PERFORMANCE';

interface AppContextType {
    user: User | null;
    summaries: Summary[];
    schedule: StudyTask[];
    quizHistory: QuizHistory[];
    page: Page;
    login: (email: string) => void;
    logout: () => void;
    addSummary: (summary: Summary) => void;
    addQuizResult: (result: QuizHistory) => void;
    setSchedule: (schedule: StudyTask[]) => void;
    updateTask: (taskId: string, isCompleted: boolean) => void;
    setPage: (page: Page) => void;
    fetchData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => StorageService.getCurrentUser());
    const [summaries, setSummaries] = useState<Summary[]>([]);
    const [schedule, setSchedule] = useState<StudyTask[]>([]);
    const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);
    const [page, setPage] = useState<Page>('DASHBOARD');

    const fetchData = useCallback(async () => {
        if (!user) return;
        try {
            const [summariesData, scheduleData, quizHistoryData] = await Promise.all([
                StorageService.getSummaries(user.email),
                StorageService.getSchedule(user.email),
                StorageService.getQuizHistory(user.email)
            ]);
            setSummaries(summariesData);
            setSchedule(scheduleData);
            setQuizHistory(quizHistoryData);
        } catch (err) {
            // In local-only mode this shouldn't fail; if it does, fall back to empties
            setSummaries([]);
            setSchedule([]);
            setQuizHistory([]);
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const login = (email: string) => {
        const loggedInUser = { email };
        StorageService.setCurrentUser(loggedInUser);
        setUser(loggedInUser);
        setPage('DASHBOARD');
    };

    const logout = () => {
        StorageService.clearCurrentUser();
        setUser(null);
        setSummaries([]);
        setSchedule([]);
        setQuizHistory([]);
    };

    const addSummary = async (summary: Summary) => {
        if(user) {
            const newSummaries = await StorageService.addSummary(user.email, summary);
            setSummaries(newSummaries);
        }
    };

    const addQuizResult = async (result: QuizHistory) => {
        try {
            const userId = user ? user.email : 'anonymous';
            const newHistory = await StorageService.addQuizHistory(userId, result);
            setQuizHistory(newHistory);
        } catch (err) {
            console.warn('Failed to save quiz result:', err);
        }
    };

    const updateTask = async (taskId: string, isCompleted: boolean) => {
        if(user) {
            const updatedSchedule = schedule.map(task => 
                task.id === taskId ? { ...task, isCompleted } : task
            );
            setSchedule(updatedSchedule);
            await StorageService.saveSchedule(user.email, updatedSchedule);
        }
    };

    const contextValue: AppContextType = {
        user,
        summaries,
        schedule,
        quizHistory,
        page,
        login,
        logout,
        addSummary,
        addQuizResult,
        setSchedule,
        updateTask,
        setPage,
        fetchData
    };

    return (
        <AppContext.Provider value={contextValue}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppContextProvider');
    }
    return context;
};