"use client";

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import { useAppContext } from './context/AppContext';
import Link from 'next/link';

// --- ICONS --- //
const Target = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>;
const CheckSquare = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>;
const Plus = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>;
const Upload = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>;
const Download = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;
const DollarSign = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const Edit = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;


// --- CONFIG --- //
const statusConfig = {
    "Planning": { text: "text-blue-400" },
    "In Progress": { text: "text-yellow-400" },
    "Live": { text: "text-green-400" },
    "Completed": { text: "text-gray-500" },
};

// --- REUSABLE COMPONENTS --- //
const StatCard = ({ title, value, icon }) => (
    <div className="bg-gray-800/50 border border-gray-800 p-5 rounded-xl">
        <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-gray-400">{title}</p>
            {icon}
        </div>
        <p className="text-3xl font-bold mt-2 text-white">{value}</p>
    </div>
);


// --- MAIN DASHBOARD PAGE COMPONENT --- //
export default function DashboardPage() {
    const { campaigns, tasks, notes, budgets, setCampaigns, setTasks, setNotes, setBudgets } = useAppContext();
    const [dateTime, setDateTime] = useState('');
    const fileInputRef = useRef(null);

    useEffect(() => {
        // Set date and time on component mount
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        setDateTime(now.toLocaleDateString('en-ZA', options));
    }, []);

    // --- Data Handlers ---
    const handleExportAll = () => {
        const allData = { campaigns, tasks, notes, budgets };
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(allData, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "adflow-hub-backup.json";
        link.click();
    };

    const handleImportAll = (event) => {
        if (!window.confirm("This will overwrite all existing data. Are you sure?")) return;
        
        const file = event.target.files[0];
        if (!file) return;

        const fileReader = new FileReader();
        fileReader.readAsText(file, "UTF-8");
        fileReader.onload = e => {
            try {
                const importedData = JSON.parse(e.target.result);
                if (importedData.campaigns && importedData.tasks && importedData.notes && importedData.budgets) {
                    setCampaigns(importedData.campaigns);
                    setTasks(importedData.tasks);
                    setNotes(importedData.notes);
                    setBudgets(importedData.budgets);
                } else {
                    alert("Invalid backup file format.");
                }
            } catch (error) {
                alert("Failed to parse backup file.");
            }
        };
        event.target.value = null; // Reset file input
    };

    // --- Dynamic Calculations ---
    const activeCampaignsCount = campaigns.filter(c => c.status === 'Live').length;
    const tasksToDoCount = tasks.filter(t => t.status === 'To Do').length;
    
    // Total budget allocated across all branches
    const totalAllocated = budgets.reduce((sum, camp) => sum + (camp.totalBudget || 0), 0);

    // Calculate how many campaigns are in the "In Progress" or "Planning" stage
    const creativesInProgressCount = campaigns.filter(c => c.status === 'In Progress' || c.status === 'Planning').length;

    const recentCampaigns = campaigns.slice(0, 5); // Show up to 5 recent campaigns
    const upcomingTasks = tasks.filter(t => t.status !== 'Done').slice(0, 5); // Show up to 5 upcoming tasks

    return (
        <div className="font-sans antialiased text-gray-200">
            <div className="flex h-screen bg-gray-950">
                <Sidebar />
                <main className="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto">
                    {/* Header */}
                    <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-white">Dashboard</h2>
                            <p className="text-gray-400 mt-1">{dateTime}, Alberton</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => fileInputRef.current.click()} className="px-4 py-2.5 text-sm font-medium bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"><Upload className="w-4 h-4" /> Import All</button>
                            <input type="file" ref={fileInputRef} onChange={handleImportAll} accept=".json" className="hidden" />
                            <button onClick={handleExportAll} className="px-4 py-2.5 text-sm font-medium bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"><Download className="w-4 h-4" /> Export All</button>
                            <Link href="/campaigns" className="px-5 py-2.5 text-sm font-semibold text-gray-950 bg-yellow-400 rounded-lg shadow-md hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
                                <Plus className="w-5 h-5" />
                                Create Campaign
                            </Link>
                        </div>
                    </header>

                    {/* Stat Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard title="Active Campaigns" value={activeCampaignsCount} icon={<Target className="w-6 h-6 text-blue-400" />} />
                        <StatCard title="Total Budget Allocated" value={`R ${totalAllocated.toLocaleString()}`} icon={<DollarSign className="w-6 h-6 text-green-400" />} />
                        <StatCard title="Creative Pipeline" value={creativesInProgressCount} icon={<Edit className="w-6 h-6 text-purple-400" />} />
                        <StatCard title="Tasks To-Do" value={tasksToDoCount} icon={<CheckSquare className="w-6 h-6 text-yellow-400" />} />
                    </div>

                    {/* Main Grid: Campaigns & Tasks */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Campaigns Section */}
                        <section className="lg:col-span-2 bg-gray-900/70 border border-gray-800 rounded-xl p-6">
                            <h3 className="text-xl font-semibold text-white mb-4">Recent Campaigns</h3>
                            <div className="space-y-4">
                                {recentCampaigns.map(campaign => (
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
                                ))}
                            </div>
                        </section>

                        {/* Tasks Section */}
                        <section className="bg-gray-900/70 border border-gray-800 rounded-xl p-6">
                            <h3 className="text-xl font-semibold text-white mb-4">Upcoming Tasks</h3>
                            <div className="space-y-4">
                                {upcomingTasks.map(task => (
                                    <div key={task.id} className="bg-gray-800/60 p-4 rounded-lg hover:bg-gray-800 transition-colors">
                                        <p className="font-semibold text-white">{task.text}</p>
                                        <div className="flex items-center justify-between mt-2">
                                            <p className="text-xs text-blue-400 bg-blue-900/50 px-2 py-0.5 rounded-full">{task.campaign}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </div>
    );
}