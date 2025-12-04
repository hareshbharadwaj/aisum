export interface User {
    email: string;
}

export interface Summary {
    id: string;
    title: string;
    originalContent: string;
    summaryContent: string;
    createdAt: string;
}

export interface StudyTask {
    id: string;
    summaryId: string;
    summaryTitle: string;
    hours: number;
    isCompleted: boolean;
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
}

export interface QuizHistory {
    id: string;
    summaryTitle: string;
    score: number;
    totalQuestions: number;
    percentage: number;
    createdAt: string;
}

export interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}