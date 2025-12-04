import { User, Summary, StudyTask, QuizHistory } from '../types';

// This service supports both API and localStorage modes
// API mode is used when the backend is available, otherwise falls back to localStorage

// --- Configuration ---
const API_URL = '/api';
const USE_API = true; // Prefer API for user auth and data; localStorage remains fallback for non-auth data

// --- Keys ---
// Session persistence: optional. When enabled, auth token and currentUser are stored in localStorage.
let inMemoryAuthToken: string | null = null;
let inMemoryCurrentUser: any = null;
let persistSession = false; // when true, persist auth token and user to localStorage
const CURRENT_USER_KEY = 'currentUser';
const AUTH_TOKEN_KEY = 'authToken';
const summariesKey = (email: string) => `summaries:${email}`;
const scheduleKey = (email: string) => `schedule:${email}`;
const quizHistoryKey = (email: string) => `quizHistory:${email}`;

// Try to restore persisted session if present
try {
    const savedToken = localStorage.getItem(AUTH_TOKEN_KEY);
    const savedUser = localStorage.getItem(CURRENT_USER_KEY);
    if (savedToken) inMemoryAuthToken = savedToken;
    if (savedUser) inMemoryCurrentUser = JSON.parse(savedUser);
    if (savedToken || savedUser) persistSession = true;
} catch (e) {
    // localStorage may be unavailable (e.g., SSR); ignore
}

// --- Helpers ---
const readJson = <T>(_key: string, fallback: T): T => {
    // We don't persist summaries/schedule/quiz in localStorage anymore; keep this for compatibility but it shouldn't be used for DB-backed data.
    return fallback;
};

const writeJson = (_key: string, _value: unknown): void => {
    // Only write auth/session keys to localStorage when session persistence is enabled
    try {
        if (!persistSession) return;
        if (_key === CURRENT_USER_KEY || _key === AUTH_TOKEN_KEY) {
            if (typeof _value === 'string') {
                localStorage.setItem(_key, _value as string);
            } else {
                localStorage.setItem(_key, JSON.stringify(_value));
            }
        }
    } catch {
        // ignore localStorage errors
    }
};

const getAuthHeaders = () => {
    const token = inMemoryAuthToken;
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

// Wrapper for API calls with localStorage fallback
const apiCall = async <T>(
    endpoint: string, 
    method: string, 
    localFallbackFn: () => T,
    body?: unknown
): Promise<T> => {
    if (!USE_API) return Promise.resolve(localFallbackFn());
    
    try {
        const response = await fetch(`${API_URL}${endpoint}` , {
            method,
            headers: getAuthHeaders(),
            body: body ? JSON.stringify(body) : undefined
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }

        const payload = await response.json();
        // normalize payloads that are { items: [...] } or { item: {...} }
        if (payload && typeof payload === 'object') {
            if ('items' in payload) return payload.items as T;
            if ('item' in payload) return payload.item as T;
        }
        return payload as T;
    } catch (error) {
        console.warn(`API call failed, using localStorage fallback: ${error}`);
        return Promise.resolve(localFallbackFn());
    }
};

// --- User & Auth ---
export const registerUser = async (email: string, password_plaintext: string): Promise<{ success: boolean; message: string }> => {
    if (!USE_API) return { success: false, message: 'Registration requires API mode. Enable backend API.' };
    const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: email.split('@')[0], email, password: password_plaintext })
    });
    if (!res.ok) {
        try {
            const json = await res.json();
            return { success: false, message: json.error || json.message || `Registration failed: ${res.status}` };
        } catch {
            return { success: false, message: `Registration failed: ${res.status}` };
        }
    }
    return { success: true, message: 'Registration successful.' };
};

export const loginUser = async (email: string, password_plaintext: string, remember?: boolean): Promise<{ success: boolean; message: string }> => {
    if (!USE_API) return { success: false, message: 'Login requires API mode. Enable backend API.' };
    const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: password_plaintext })
    });
    if (!res.ok) {
        try {
            const json = await res.json();
            return { success: false, message: json.error || json.message || `Login failed: ${res.status}` };
        } catch {
            return { success: false, message: `Login failed: ${res.status}` };
        }
    }
    const data = await res.json();
    // handle 'remember me' flag
    if (typeof remember === 'boolean') persistSession = remember;
    // store token and user in-memory and persist if requested
    if (data.token) {
        inMemoryAuthToken = data.token;
        writeJson(AUTH_TOKEN_KEY, data.token);
    }
    if (data.user) {
        setCurrentUser({ email: data.user.email });
        writeJson(CURRENT_USER_KEY, { email: data.user.email });
    }
    return { success: true, message: 'Login successful.' };
};

export const getCurrentUser = (): User | null => {
    // in-memory current user only (no localStorage persistence)
    return inMemoryCurrentUser as User | null;
};

export const setCurrentUser = (user: User): void => {
    inMemoryCurrentUser = user;
    writeJson(CURRENT_USER_KEY, user);
};

export const clearCurrentUser = (): void => {
    inMemoryCurrentUser = null;
    inMemoryAuthToken = null;
    try {
        localStorage.removeItem(CURRENT_USER_KEY);
        localStorage.removeItem(AUTH_TOKEN_KEY);
    } catch {
        // ignore
    }
};

// --- Summaries ---
export const getSummaries = async (userEmail: string): Promise<Summary[]> => {
    try {
        const res = await fetch(`${API_URL}/summaries?userId=${encodeURIComponent(userEmail)}`, {
            method: 'GET',
            headers: getAuthHeaders()
        });
        if (!res.ok) return [];
        const payload = await res.json();
        return (payload && payload.items) ? payload.items as Summary[] : [];
    } catch (err) {
        console.warn('Failed to fetch summaries:', err);
        return [];
    }
};

export const addSummary = async (userEmail: string, summary: Summary): Promise<Summary[]> => {
    try {
        const res = await fetch(`${API_URL}/summaries`, {
            method: 'POST',
            headers: { ...getAuthHeaders(), 'x-user-id': userEmail, 'Content-Type': 'application/json' },
            body: JSON.stringify(summary)
        });
        if (!res.ok) throw new Error('Failed to add summary');
        return getSummaries(userEmail);
    } catch (err) {
        console.warn('Failed to add summary:', err);
        throw err;
    }
};

// --- Schedule ---
export const getSchedule = async (userEmail: string): Promise<StudyTask[]> => {
    try {
        const res = await fetch(`${API_URL}/schedules?userId=${encodeURIComponent(userEmail)}`, { method: 'GET', headers: getAuthHeaders() });
        if (!res.ok) return [];
        const payload = await res.json();
        return (payload && payload.items) ? payload.items as StudyTask[] : [];
    } catch (err) {
        console.warn('Failed to fetch schedule:', err);
        return [];
    }
};

export const saveSchedule = async (userEmail: string, schedule: StudyTask[]): Promise<void> => {
    try {
        const res = await fetch(`${API_URL}/schedules`, {
            method: 'POST',
            headers: { ...getAuthHeaders(), 'x-user-id': userEmail, 'Content-Type': 'application/json' },
            body: JSON.stringify({ date: new Date().toISOString(), tasks: schedule })
        });
        if (!res.ok) throw new Error('Failed to save schedule');
        return Promise.resolve();
    } catch (err) {
        console.warn('Failed to save schedule:', err);
        throw err;
    }
};

// --- Quiz History ---
export const getQuizHistory = async (userEmail: string): Promise<QuizHistory[]> => {
    try {
        const res = await fetch(`${API_URL}/quiz/history?userId=${encodeURIComponent(userEmail)}`, { method: 'GET', headers: getAuthHeaders() });
        if (!res.ok) return [];
        const payload = await res.json();
        return (payload && payload.items) ? payload.items as QuizHistory[] : [];
    } catch (err) {
        console.warn('Failed to fetch quiz history:', err);
        return [];
    }
};

export const addQuizHistory = async (userEmail: string, result: QuizHistory): Promise<QuizHistory[]> => {
    try {
        const res = await fetch(`${API_URL}/quiz/history`, {
            method: 'POST',
            headers: { ...getAuthHeaders(), 'x-user-id': userEmail, 'Content-Type': 'application/json' },
            body: JSON.stringify(result)
        });
        if (!res.ok) throw new Error('Failed to add quiz history');
        return getQuizHistory(userEmail);
    } catch (err) {
        console.warn('Failed to add quiz history:', err);
        throw err;
    }
};

// Save generated summary and original document to DB
export const saveSummaryToDb = async (userEmail: string, docMeta: { filename?: string; mimetype?: string; size?: number; contentJson?: any }, title: string, sum_notes: string) => {
    if (!USE_API) throw new Error('DB save requires API mode');
    const res = await fetch(`${API_URL}/summaries/save`, {
        method: 'POST',
        headers: { ...getAuthHeaders(), 'x-user-id': userEmail },
        body: JSON.stringify({ ...docMeta, title, sum_notes })
    });
    if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.error || 'Failed to save summary to DB');
    }
    return await res.json();
};