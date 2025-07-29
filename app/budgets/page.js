"use client";

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { useAppContext } from '../context/AppContext';

// --- ICONS --- //
const Plus = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>;
const DollarSign = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const Edit = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const Trash2 = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const Store = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2V7"/></svg>;

// --- CONFIG --- //
const BRANCHES = ["Alberton", "Vanderbijlpark", "Sasolburg", "National"];

// --- REUSABLE COMPONENTS --- //
const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-gray-800/50 border border-gray-800 p-5 rounded-xl">
        <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-gray-400">{title}</p>
            <div className={`p-2 rounded-lg ${color}`}>{icon}</div>
        </div>
        <p className="text-3xl font-bold mt-2 text-white">{value}</p>
    </div>
);

const BudgetEditorModal = ({ isOpen, onClose, onSave, budgetToEdit }) => {
    const [name, setName] = useState('');
    const [branch, setBranch] = useState(BRANCHES[0]);
    const [totalBudget, setTotalBudget] = useState('');
    const [dailyBudget, setDailyBudget] = useState('');
    const [spent, setSpent] = useState('');

    useEffect(() => {
        if (budgetToEdit) {
            setName(budgetToEdit.name || '');
            setBranch(budgetToEdit.branch || BRANCHES[0]);
            setTotalBudget(budgetToEdit.totalBudget || '');
            setDailyBudget(budgetToEdit.dailyBudget || '');
            setSpent(budgetToEdit.spent || 0);
        } else {
            setName(''); 
            setBranch(BRANCHES[0]); 
            setTotalBudget(''); 
            setDailyBudget(''); 
            setSpent(0);
        }
    }, [budgetToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const savedBudget = { 
            ...budgetToEdit, 
            id: budgetToEdit ? budgetToEdit.id : undefined, 
            name, 
            branch, 
            totalBudget: parseFloat(totalBudget) || 0, 
            dailyBudget: parseFloat(dailyBudget) || 0, 
            spent: parseFloat(spent) || 0, 
            status: budgetToEdit?.status || 'Planning', 
            startDate: budgetToEdit?.startDate || new Date().toISOString().slice(0,10) 
        };
        onSave(savedBudget);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-800 w-full max-w-lg rounded-xl shadow-2xl m-4" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center justify-between p-6 border-b border-gray-800"><h3 className="text-xl font-semibold text-white">{budgetToEdit ? 'Edit Budget' : 'Add Campaign Budget'}</h3><button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button></div>
                    <div className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Campaign Name</label><input type="text" id="name" value={name} onChange={e => setName(e.target.value)} required className="w-full bg-gray-800 border-gray-700 rounded-lg p-2 text-white" /></div>
                            <div><label htmlFor="branch" className="block text-sm font-medium text-gray-300 mb-1">Branch</label><select id="branch" value={branch} onChange={e => setBranch(e.target.value)} className="w-full bg-gray-800 border-gray-700 rounded-lg p-2 text-white">{BRANCHES.map(b => <option key={b}>{b}</option>)}</select></div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div><label htmlFor="totalBudget" className="block text-sm font-medium text-gray-300 mb-1">Total (R)</label><input type="number" id="totalBudget" value={totalBudget} onChange={e => setTotalBudget(e.target.value)} required className="w-full bg-gray-800 border-gray-700 rounded-lg p-2 text-white" /></div>
                            <div><label htmlFor="dailyBudget" className="block text-sm font-medium text-gray-300 mb-1">Daily (R)</label><input type="number" id="dailyBudget" value={dailyBudget} onChange={e => setDailyBudget(e.target.value)} required className="w-full bg-gray-800 border-gray-700 rounded-lg p-2 text-white" /></div>
                            <div><label htmlFor="spent" className="block text-sm font-medium text-gray-300 mb-1">Spent (R)</label><input type="number" id="spent" value={spent} onChange={e => setSpent(e.target.value)} required className="w-full bg-gray-800 border-gray-700 rounded-lg p-2 text-white" /></div>
                        </div>
                    </div>
                    <div className="flex items-center justify-end p-6 border-t border-gray-800 space-x-2"><button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-gray-700 rounded-lg">Cancel</button><button type="submit" className="px-4 py-2 text-sm font-semibold text-gray-950 bg-yellow-400 rounded-lg">Save Budget</button></div>
                </form>
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT --- //
export default function BudgetsPage() {
    // UPDATED: Get new functions from context
    const { budgets, saveData, deleteData, loading } = useAppContext();
    
    const [isModalOpen, setModalOpen] = useState(false);
    const [budgetToEdit, setBudgetToEdit] = useState(null);

    // UPDATED: handleSaveBudget now uses the generic saveData function
    const handleSaveBudget = async (savedBudget) => {
        try {
            await saveData('budgets', savedBudget);
            setModalOpen(false);
        } catch (error) {
            console.error("Error saving budget:", error);
            alert("Failed to save budget. Please check the console for details.");
        }
    };
    
    const handleAddClick = () => { setBudgetToEdit(null); setModalOpen(true); };
    const handleEditClick = (budget) => { setBudgetToEdit(budget); setModalOpen(true); };
    
    // UPDATED: handleDeleteClick now uses the generic deleteData function
    const handleDeleteClick = async (id) => { 
        if(window.confirm('Are you sure you want to delete this budget entry?')) { 
            await deleteData('budgets', id);
        }
    };

    // --- CALCULATIONS (No changes) --- //
    const totalAllocated = budgets.reduce((sum, camp) => sum + (camp.totalBudget || 0), 0);
    const totalSpent = budgets.reduce((sum, camp) => sum + (camp.spent || 0), 0);
    const totalRemaining = totalAllocated - totalSpent;
    const activeDailySpend = budgets.filter(c => c.status === 'Live').reduce((sum, camp) => sum + (camp.dailyBudget || 0), 0);
    
    const spendByBranch = budgets.reduce((acc, budget) => {
        const branch = budget.branch || 'Unassigned';
        if (!acc[branch]) {
            acc[branch] = 0;
        }
        acc[branch] += budget.spent || 0;
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-950 text-white items-center justify-center">
                Loading Budgets...
            </div>
        )
    }

    return (
        <div className="font-sans antialiased text-gray-200">
            <div className="flex h-screen bg-gray-950">
                <Sidebar />
                <main className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col">
                    <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 flex-shrink-0">
                        <div>
                            <h2 className="text-3xl font-bold text-white">Budgets Dashboard</h2>
                            <p className="text-gray-400 mt-1">Your financial command center for all ad spend.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleAddClick} className="px-5 py-2.5 text-sm font-semibold text-gray-950 bg-yellow-400 rounded-lg shadow-md hover:bg-yellow-300 transition-colors flex items-center gap-2 whitespace-nowrap"><Plus className="w-5 h-5" />Add Budget</button>
                        </div>
                    </header>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard title="Total Allocated" value={`R ${totalAllocated.toLocaleString()}`} icon={<DollarSign className="w-6 h-6" />} color="bg-blue-900/50 text-blue-300" />
                        <StatCard title="Total Spent" value={`R ${totalSpent.toLocaleString()}`} icon={<DollarSign className="w-6 h-6" />} color="bg-yellow-900/50 text-yellow-300" />
                        <StatCard title="Total Remaining" value={`R ${totalRemaining.toLocaleString()}`} icon={<DollarSign className="w-6 h-6" />} color="bg-green-900/50 text-green-300" />
                        <StatCard title="Active Daily Spend" value={`R ${activeDailySpend.toLocaleString()}`} icon={<DollarSign className="w-6 h-6" />} color="bg-purple-900/50 text-purple-300" />
                    </div>

                    <div className="mb-8">
                        <h3 className="text-xl font-semibold text-white mb-4">Spend by Branch</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {Object.entries(spendByBranch).map(([branch, spend]) => (
                                <div key={branch} className="bg-gray-800/50 border border-gray-800 p-5 rounded-xl">
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm font-medium text-gray-400 flex items-center gap-2"><Store className="w-4 h-4"/>{branch}</p>
                                    </div>
                                    <p className="text-3xl font-bold mt-2 text-white">R {spend.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-gray-900/70 border border-gray-800 rounded-xl flex-1 overflow-auto">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 bg-gray-900/70 backdrop-blur-sm"><tr className="border-b border-gray-800">
                                <th className="p-4 text-sm font-semibold text-gray-400">Campaign</th>
                                <th className="p-4 text-sm font-semibold text-gray-400">Branch</th>
                                <th className="p-4 text-sm font-semibold text-gray-400">Total Budget</th>
                                <th className="p-4 text-sm font-semibold text-gray-400">Spent</th>
                                <th className="p-4 text-sm font-semibold text-gray-400">Progress</th>
                                <th className="p-4 text-sm font-semibold text-gray-400">Actions</th>
                            </tr></thead>
                            <tbody className="divide-y divide-gray-800">
                                {budgets.map(budget => {
                                    const progress = budget.totalBudget > 0 ? ((budget.spent || 0) / budget.totalBudget) * 100 : 0;
                                    return (
                                        <tr key={budget.id} className="hover:bg-gray-800/60 transition-colors">
                                            <td className="p-4 font-medium text-white">{budget.name}</td>
                                            <td className="p-4 text-gray-300">{budget.branch}</td>
                                            <td className="p-4 text-gray-300">R {budget.totalBudget?.toLocaleString() || 0}</td>
                                            <td className="p-4 text-yellow-300">R {budget.spent?.toLocaleString() || 0}</td>
                                            <td className="p-4"><div className="w-full bg-gray-700 rounded-full h-2.5"><div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div></div></td>
                                            <td className="p-4"><div className="flex gap-2">
                                                <button onClick={() => handleEditClick(budget)} className="text-gray-400 hover:text-white"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => handleDeleteClick(budget.id)} className="text-gray-400 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                                            </div></td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </main>
                <BudgetEditorModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveBudget} budgetToEdit={budgetToEdit} />
            </div>
        </div>
    );
}
