// app/page.js
"use client";
import React, { useState, useEffect, useRef, memo } from 'react';
import Sidebar from './components/Sidebar';
import { useAppContext } from './context/AppContext';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { z } from 'zod';
import ConfirmationModal from './components/ui/ConfirmationModal';
import SkeletonCard from './components/ui/SkeletonCard';
import { Target, CheckSquare, Plus, Upload, Download, DollarSign, Edit } from './components/icons';

const statusConfig = {
    "Planning": { text: "text-blue-400" },
    "In Progress": { text: "text-yellow-400" },
    "Live": { text: "text-green-400" },
    "Completed": { text: "text-gray-500" },
};

const StatCard = memo(({ title, value, icon }) => (
    <div className="bg-gray-800/50 border border-gray-800 p-5 rounded-xl">
        <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-gray-400">{title}</p>
            {icon}
        </div>
        <p className="text-3xl font-bold mt-2 text-white">{value}</p>
    </div>
));
StatCard.displayName = 'StatCard';

const importedDataSchema = z.object({
    campaigns: z.array(z.object({ id: z.string().optional(), name: z.string(), status: z.string() })).optional(),
    tasks: z.array(z.object({ id: z.string().optional(), text: z.string(), status: z.string() })).optional(),
    notes: z.array(z.object({ id: z.string().optional(), title: z.string() })).optional(),
    budgets: z.array(z.object({ id: z.string().optional(), name: z.string(), totalBudget: z.number() })).optional(),
}).strict();

export default function DashboardPage() {
    const { campaigns, tasks, notes, budgets, setCampaigns, setTasks, setNotes, setBudgets, loading } = useAppContext();
    const [dateTime, setDateTime] = useState('');
    const fileInputRef = useRef(null);
    const [isImportConfirmOpen, setImportConfirmOpen] = useState(false);
    const [fileToImport, setFileToImport] = useState(null);

    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            setDateTime(now.toLocaleDateString('en-ZA', options));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const handleExportAll = () => {
        const allData = { campaigns, tasks, notes, budgets };
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(allData, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = `adflow-hub-backup-${new Date().toISOString().slice(0,10)}.json`;
        link.click();
        toast.success("All data exported successfully!");
    };

    const handleImportFileSelect = (event) => {
        const file = event.target.files[0];
        if (!file) return;
        handleExportAll();
        toast.info("Created a backup of your current data just in case.");
        setFileToImport(file);
        setImportConfirmOpen(true);
        event.target.value = null;
    };

    const executeImport = () => {
        if (!fileToImport) return;
        const fileReader = new FileReader();
        fileReader.readAsText(fileToImport, "UTF-8");
        fileReader.onload = e => {
            try {
                const importedData = JSON.parse(e.target.result);
                const result = importedDataSchema.safeParse(importedData);
                if (!result.success) {
                    const errorDetails = result.error.errors.map(err => `${err.path.join('.')} - ${err.message}`).join('; ');
                    toast.error("Invalid backup file format. Details in console.");
                    console.error("Import validation errors:", errorDetails);
                    return;
                }
                if (result.data.campaigns) setCampaigns(result.data.campaigns);
                if (result.data.tasks) setTasks(result.data.tasks);
                if (result.data.notes) setNotes(result.data.notes);
                if (result.data.budgets) setBudgets(result.data.budgets);
                toast.success("Data imported successfully!");
            } catch (error) {
                toast.error("Failed to parse backup file.");
                console.error("Error parsing imported file:", error);
            }
        };
        setImportConfirmOpen(false);
        setFileToImport(null);
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-950">
                <Sidebar />
                <main id="main-content" className="flex-1 p-6 md:p-8 lg:p-10">
                    <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                         <div>
                            <div className="h-9 bg-gray-700 rounded w-48 mb-2 animate-pulse"></div>
                            <div className="h-5 bg-gray-700 rounded w-64 animate-pulse"></div>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="h-11 bg-gray-700 rounded-lg w-32 animate-pulse"></div>
                           <div className="h-11 bg-gray-700 rounded-lg w-32 animate-pulse"></div>
                           <div className="h-11 bg-gray-700 rounded-lg w-40 animate-pulse"></div>
                        </div>
                    </header>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                        <SkeletonCard />
                    </div>
                </main>
            </div>
        );
    }
    
    const activeCampaignsCount = campaigns.filter(c => c.status === 'Live').length;
    const tasksToDoCount = tasks.filter(t => t.status === 'To Do').length;
    const totalAllocated = budgets.reduce((sum, camp) => sum + (camp.totalBudget || 0), 0);
    const creativesInProgressCount = campaigns.filter(c => c.status === 'In Progress' || c.status === 'Planning').length;
    const recentCampaigns = campaigns.slice(0, 5);
    const upcomingTasks = tasks.filter(t => t.status !== 'Done').slice(0, 5);

    return (
        <div className="font-sans antialiased text-gray-200">
            <div className="flex h-screen bg-gray-950">
                <Sidebar />
                <main id="main-content" className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
                    <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-white">Dashboard</h2>
                            <p className="text-gray-400 mt-1">{dateTime}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => fileInputRef.current.click()} className="px-4 py-2.5 text-sm font-medium bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2" aria-label="Import All Data">
                                <Upload className="w-4 h-4" /> Import All
                            </button>
                            <input type="file" ref={fileInputRef} onChange={handleImportFileSelect} accept=".json" className="hidden" />
                            <button onClick={handleExportAll} className="px-4 py-2.5 text-sm font-medium bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2" aria-label="Export All Data">
                                <Download className="w-4 h-4" /> Export All
                            </button>
                            <Link href="/campaigns" className="px-5 py-2.5 text-sm font-semibold text-gray-950 bg-yellow-400 rounded-lg shadow-md hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
                                <Plus className="w-5 h-5" />
                                Create Campaign
                            </Link>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard title="Active Campaigns" value={activeCampaignsCount} icon={<Target className="w-6 h-6 text-blue-400" />} />
                        <StatCard title="Total Budget Allocated" value={`R ${totalAllocated.toLocaleString()}`} icon={<DollarSign className="w-6 h-6 text-green-400" />} />
                        <StatCard title="Creative Pipeline" value={creativesInProgressCount} icon={<Edit className="w-6 h-6 text-purple-400" />} />
                        <StatCard title="Tasks To-Do" value={tasksToDoCount} icon={<CheckSquare className="w-6 h-6 text-yellow-400" />} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <section className="lg:col-span-2 bg-gray-900/70 border border-gray-800 rounded-xl p-6">
                            <h3 className="text-xl font-semibold text-white mb-4">Recent Campaigns</h3>
                            <div className="space-y-4">
                                {recentCampaigns.length > 0 ? recentCampaigns.map(campaign => (
                                    <Link href={`/campaigns/${campaign.id}`} key={campaign.id} className="bg-gray-800/60 p-4 rounded-lg flex items-center justify-between hover:bg-gray-800 transition-colors cursor-pointer">
                                        <div>
                                            <p className="font-semibold text-white">{campaign.name}</p>
                                            <p className="text-sm text-gray-400">{campaign.objective}</p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[campaign.status]?.text}`}>
                                                <span className={`w-2 h-2 rounded-full bg-current`}></span>
                                                {campaign.status}
                                            </span>
                                        </div>
                                    </Link>
                                )) : <p className="text-gray-500">No campaigns found. Create one to get started!</p>}
                            </div>
                        </section>

                        <section className="bg-gray-900/70 border border-gray-800 rounded-xl p-6">
                            <h3 className="text-xl font-semibold text-white mb-4">Upcoming Tasks</h3>
                            <div className="space-y-4">
                                {upcomingTasks.length > 0 ? upcomingTasks.map(task => (
                                    <div key={task.id} className="bg-gray-800/60 p-4 rounded-lg hover:bg-gray-800 transition-colors">
                                        <p className="font-semibold text-white">{task.text}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <p className="text-xs text-blue-400 bg-blue-900/50 px-2 py-0.5 rounded-full">{task.campaign}</p>
                                        </div>
                                    </div>
                                )) : <p className="text-gray-500">No upcoming tasks.</p>}
                            </div>
                        </section>
                    </div>
                </main>
            </div>
            <ConfirmationModal
                isOpen={isImportConfirmOpen}
                onClose={() => setImportConfirmOpen(false)}
                onConfirm={executeImport}
                message="Importing data will overwrite all existing data. A backup has been automatically created. Are you sure you want to proceed?"
            />
        </div>
    );
}