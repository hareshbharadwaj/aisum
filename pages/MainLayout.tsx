import React, { ReactNode } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { DashboardIcon, UploadIcon, BookOpenIcon, LightBulbIcon, ClipboardListIcon, LogoutIcon, ChartBarIcon } from '../components/Icons';

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    isActive: boolean;
    onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
            isActive
                ? 'bg-sky-100 text-sky-700'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
        }`}
    >
        {icon}
        <span className="ml-3">{label}</span>
    </button>
);

const MainLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, logout, page, setPage } = useAppContext();

    const navItems = [
        { id: 'DASHBOARD', label: 'Dashboard', icon: <DashboardIcon className="w-5 h-5" /> },
        { id: 'UPLOAD', label: 'Upload Notes', icon: <UploadIcon className="w-5 h-5" /> },
        { id: 'SUMMARIES', label: 'Summaries', icon: <BookOpenIcon className="w-5 h-5" /> },
        { id: 'QUIZ', label: 'Quiz', icon: <LightBulbIcon className="w-5 h-5" /> },
        { id: 'SCHEDULE', label: 'Study Schedule', icon: <ClipboardListIcon className="w-5 h-5" /> },
        { id: 'PERFORMANCE', label: 'Performance', icon: <ChartBarIcon className="w-5 h-5" /> },
    ];

    return (
        <div className="flex h-screen bg-slate-100">
            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 bg-white border-r border-slate-200 flex flex-col">
                <div className="h-16 flex items-center justify-center border-b border-slate-200">
                    <h1 className="text-xl font-bold text-sky-600">Study Companion</h1>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    {navItems.map(item => (
                        <NavItem
                            key={item.id}
                            label={item.label}
                            icon={item.icon}
                            isActive={page === item.id}
                            onClick={() => setPage(item.id as any)}
                        />
                    ))}
                </nav>
                 <div className="p-4 border-t border-slate-200">
                    <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center text-white font-bold text-lg">
                            {user?.email[0].toUpperCase()}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-slate-800 truncate">{user?.email}</p>
                            <p className="text-xs text-slate-500">Student</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                        <LogoutIcon className="w-5 h-5 mr-2" />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="p-8">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;