import React from 'react';
import { AppContextProvider, useAppContext } from './contexts/AppContext';
import AuthPage from './pages/AuthPage';
import MainLayout from './pages/MainLayout';
import Dashboard from './pages/Dashboard';
import UploadPage from './pages/UploadPage';
import SummariesPage from './pages/SummariesPage';
import QuizPage from './pages/QuizPage';
import SchedulePage from './pages/SchedulePage';
import PerformancePage from './pages/PerformancePage';

const App: React.FC = () => {
    return (
        <AppContextProvider>
            <AppContent />
        </AppContextProvider>
    );
};

const AppContent: React.FC = () => {
    const { user, page } = useAppContext();

    if (!user) {
        return <AuthPage />;
    }

    const renderPage = () => {
        switch (page) {
            case 'DASHBOARD':
                return <Dashboard />;
            case 'UPLOAD':
                return <UploadPage />;
            case 'SUMMARIES':
                return <SummariesPage />;
            case 'QUIZ':
                return <QuizPage />;
            case 'SCHEDULE':
                return <SchedulePage />;
            case 'PERFORMANCE':
                return <PerformancePage />;
            default:
                return <Dashboard />;
        }
    };

    return <MainLayout>{renderPage()}</MainLayout>;
};

export default App;