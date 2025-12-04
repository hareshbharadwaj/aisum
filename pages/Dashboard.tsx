import React from 'react';
import { useAppContext } from '../contexts/AppContext';
import { UploadIcon, BookOpenIcon, LightBulbIcon, ClipboardListIcon } from '../components/Icons';

const DashboardCard: React.FC<{
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
}> = ({ title, description, icon, onClick }) => (
    <div 
        onClick={onClick}
        className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer border border-slate-200"
    >
        <div className="flex items-start">
            <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
                    {icon}
                </div>
            </div>
            <div className="ml-4">
                <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
                <p className="mt-1 text-slate-500">{description}</p>
            </div>
        </div>
    </div>
);


const Dashboard: React.FC = () => {
    const { user, setPage, schedule, summaries } = useAppContext();

    const completedTasks = schedule.filter(task => task.isCompleted);
    const allTasksCompleted = schedule.length > 0 && completedTasks.length === schedule.length;
    const totalStudyHours = allTasksCompleted 
        ? schedule.reduce((acc, task) => acc + task.hours, 0)
        : null;
        
    const totalTasks = schedule.length;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks.length / totalTasks) * 100) : 0;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">Welcome back, {user?.email.split('@')[0]}!</h1>
                <p className="mt-2 text-lg text-slate-600">Ready to boost your learning? Here's your study hub.</p>
            </div>
            
            {schedule.length > 0 && (
                <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-slate-800">Study Progress</h3>
                        <span className="text-sm font-medium text-sky-600">{`${completionPercentage}% Complete`}</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-4">
                        <div 
                            className="bg-sky-600 h-4 rounded-full transition-all duration-500" 
                            style={{ width: `${completionPercentage}%` }}
                            role="progressbar"
                            aria-valuenow={completionPercentage}
                            aria-valuemin={0}
                            aria-valuemax={100}
                        ></div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                <DashboardCard 
                    title="Upload Notes"
                    description="Turn your lecture notes into smart study assets."
                    icon={<UploadIcon className="w-6 h-6" />}
                    onClick={() => setPage('UPLOAD')}
                />
                <DashboardCard 
                    title="View Summaries"
                    description="Access all your AI-generated summaries."
                    icon={<BookOpenIcon className="w-6 h-6" />}
                    onClick={() => setPage('SUMMARIES')}
                />
                <DashboardCard 
                    title="Take a Quiz"
                    description="Test your knowledge with a fresh set of questions."
                    icon={<LightBulbIcon className="w-6 h-6" />}
                    onClick={() => setPage('QUIZ')}
                />
                <DashboardCard 
                    title="Study Schedule"
                    description="Organize your study sessions and track progress."
                    icon={<ClipboardListIcon className="w-6 h-6" />}
                    onClick={() => setPage('SCHEDULE')}
                />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                    <h3 className="font-semibold text-slate-800">Total Notes Summarized</h3>
                    <p className="text-4xl font-bold text-sky-600 mt-2">{summaries.length}</p>
                 </div>
                 <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                    <h3 className="font-semibold text-slate-800">Tasks in Schedule</h3>
                    <p className="text-4xl font-bold text-indigo-600 mt-2">{schedule.length}</p>
                 </div>
                 <div className="bg-white p-6 rounded-xl shadow-md border border-slate-200">
                    <h3 className="font-semibold text-slate-800">Completed Tasks</h3>
                     <p className="text-4xl font-bold text-emerald-600 mt-2">{completedTasks.length}</p>
                 </div>
            </div>

            {totalStudyHours !== null && (
                 <div className="bg-gradient-to-r from-green-400 to-teal-500 text-white p-6 rounded-xl shadow-lg">
                    <h3 className="text-2xl font-bold">Congratulations!</h3>
                    <p className="mt-2 text-lg">You've completed all your study tasks. Total hours studied:</p>
                    <p className="text-5xl font-extrabold mt-3">{totalStudyHours} hours</p>
                </div>
            )}
        </div>
    );
};

export default Dashboard;