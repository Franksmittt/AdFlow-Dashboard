// app/budgets/BudgetClientView.js
"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import { z } from 'zod';
import toast from 'react-hot-toast';

// --- ICONS --- //
import Plus from '../components/icons/Plus';
import DollarSign from '../components/icons/DollarSign';
import Edit from '../components/icons/Edit';
import Trash2 from '../components/icons/Trash2';
import Store from '../components/icons/Store';

// --- Custom Confirmation Modal ---
const ConfirmationModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-2xl m-4">
        <p className="text-white mb-6 text-lg">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 text-sm font-medium bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="px-5 py-2 text-sm font-semibold text-gray-950 bg-red-500 rounded-lg hover:bg-red-400 transition-colors">Confirm</button>
        </div>
      </div>
    </div>
  );
};

// --- CONFIG & SCHEMA --- //
const BRANCHES = ["Alberton", "Vanderbijlpark", "Sasolburg", "National"];
const budgetSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Campaign Name is required." }).max(100),
  branch: z.string(),
  totalBudget: z.number().min(0, { message: "Total Budget must be a positive number." }),
  dailyBudget: z.number().min(0, { message: "Daily Budget must be a positive number." }),
  spent: z.number().min(0, { message: "Spent amount must be a positive number." }),
  status: z.string(),
  startDate: z.string(),
});

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

const BudgetEditorModal = ({ isOpen, onClose, onSave, budgetToEdit, isSaving }) => {
    const [name, setName] = useState('');
    const [branch, setBranch] = useState(BRANCHES[0]);
    const [totalBudget, setTotalBudget] = useState('');
    const [dailyBudget, setDailyBudget] = useState('');
    const [spent, setSpent] = useState('');
    const modalRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            if (budgetToEdit) {
                setName(budgetToEdit.name || '');
                setBranch(budgetToEdit.branch || BRANCHES[0]);
                setTotalBudget(budgetToEdit.totalBudget || '');
                setDailyBudget(budgetToEdit.dailyBudget || '');
                setSpent(budgetToEdit.spent || 0);
            } else {
                setName(''); setBranch(BRANCHES[0]); setTotalBudget(''); setDailyBudget(''); setSpent(0);
            }
            if (modalRef.current) {
              modalRef.current.focus();
            }
        }
    }, [budgetToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const budgetData = {
            ...budgetToEdit,
            id: budgetToEdit?.id, name, branch,
            totalBudget: parseFloat(totalBudget) || 0,
            dailyBudget: parseFloat(dailyBudget) || 0,
            spent: parseFloat(spent) || 0,
            status: budgetToEdit?.status || 'Planning',
            startDate: budgetToEdit?.startDate || new Date().toISOString().slice(0,10)
        };
        const result = budgetSchema.safeParse(budgetData);
        if (!result.success) {
            const errorMessages = result.error.errors.map(err => err.message).join('\n');
            toast.error(`Validation failed:\n${errorMessages}`);
            return;
        }
        onSave(result.data);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div ref={modalRef} tabIndex="-1" className="bg-gray-900 border border-gray-800 w-full max-w-lg rounded-xl shadow-2xl m-4" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center justify-between p-6 border-b border-gray-800">
                       <h3 className="text-xl font-semibold text-white">{budgetToEdit ? 'Edit Budget' : 'Add Campaign Budget'}</h3>
                      <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none" aria-label="Close modal">&times;</button>
                    </div>
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
                    <div className="flex items-center justify-end p-6 border-t border-gray-800 space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-gray-700 rounded-lg">Cancel</button>
                        <button type="submit" disabled={isSaving} className="px-4 py-2 text-sm font-semibold text-gray-950 bg-yellow-400 rounded-lg disabled:bg-gray-500 disabled:cursor-not-allowed">
                            {isSaving ? 'Saving...' : 'Save Budget'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default function BudgetClientView({ initialBudgets }) {
    // FIX: Removed local state and redundant listener. Now consumes global state from context.
    const { budgets, saveData, deleteData, loading } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);
    const [budgetToEdit, setBudgetToEdit] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const [budgetToDelete, setBudgetToDelete] = useState(null);

    const handleSaveBudget = async (savedBudget) => {
        setIsSaving(true);
        try {
            await toast.promise(
                saveData('budgets', savedBudget),
                {
                    loading: 'Saving budget...',
                    success: 'Budget saved successfully!',
                    error: 'Failed to save budget.',
                }
            );
            setModalOpen(false);
        } catch (error) {
            // Toast will handle the error message
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddClick = () => { setBudgetToEdit(null); setModalOpen(true); };
    const handleEditClick = (budget) => { setBudgetToEdit(budget); setModalOpen(true); };

    const handleDeleteClick = (id) => {
        setBudgetToDelete(id);
        setConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!budgetToDelete) return;
        try {
            await deleteData('budgets', budgetToDelete);
            toast.success('Budget deleted.');
        } catch (error) {
            toast.error('Failed to delete budget.');
        } finally {
            setConfirmOpen(false);
            setBudgetToDelete(null);
        }
    };
    
    if (loading) {
        return (
            <div className="flex h-screen bg-gray-950">
                <Sidebar />
                <main className="flex-1 flex items-center justify-center text-white">
                    <p>Loading Budgets...</p>
                </main>
            </div>
        );
    }

    const totalAllocated = budgets.reduce((sum, camp) => sum + (camp.totalBudget || 0), 0);
    const totalSpent = budgets.reduce((sum, camp) => sum + (camp.spent || 0), 0);
    const totalRemaining = totalAllocated - totalSpent;
    const activeDailySpend = budgets.filter(b => b.status === 'Live').reduce((sum, camp) => sum + (camp.dailyBudget || 0), 0);
    const spendByBranch = budgets.reduce((acc, budget) => {
        const branch = budget.branch || 'Unassigned';
        if (!acc[branch]) acc[branch] = 0;
        acc[branch] += budget.spent || 0;
        return acc;
    }, {});

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
                            <button onClick={handleAddClick} className="px-5 py-2.5 text-sm font-semibold text-gray-950 bg-yellow-400 rounded-lg shadow-md hover:bg-yellow-300 transition-colors flex items-center gap-2 whitespace-nowrap" aria-label="Add New Budget"><Plus className="w-5 h-5" />Add Budget</button>
                        </div>
                    </header>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard
                            title="Total Allocated" value={`R ${totalAllocated.toLocaleString()}`} icon={<DollarSign className="w-6 h-6" />} color="bg-blue-900/50 text-blue-300" />
                        <StatCard title="Total Spent" value={`R ${totalSpent.toLocaleString()}`} icon={<DollarSign className="w-6 h-6" />} color="bg-yellow-900/50 text-yellow-300" />
                        <StatCard title="Total Remaining" value={`R ${totalRemaining.toLocaleString()}`} icon={<DollarSign className="w-6 h-6" />} color="bg-green-900/50 text-green-300" />
                        <StatCard title="Active Daily Spend" value={`R ${activeDailySpend.toLocaleString()}`} icon={<DollarSign className="w-6 h-6" />} color="bg-purple-900/50 text-purple-300" />
                    </div>
                    <div className="mb-8">
                        <h3 className="text-xl font-semibold text-white mb-4">Spend by Branch</h3>
                         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {Object.entries(spendByBranch).map(([branch, spend]) => (
                                <div key={branch} className="bg-gray-800/50 border border-gray-800 p-5 rounded-xl">
                                    <p className="text-sm font-medium text-gray-400 flex items-center gap-2"><Store className="w-4 h-4"/>{branch}</p>
                                    <p className="text-3xl font-bold mt-2 text-white">R {spend.toLocaleString()}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                     <div className="bg-gray-900/70 border border-gray-800 rounded-xl flex-1 overflow-auto">
                        <table className="w-full text-left">
                            <thead className="sticky top-0 bg-gray-900/70 backdrop-blur-sm">
                                <tr className="border-b border-gray-800">
                                    <th className="p-4 text-sm font-semibold text-gray-400">Campaign</th>
                                    <th className="p-4 text-sm font-semibold text-gray-400">Branch</th>
                                    <th className="p-4 text-sm font-semibold text-gray-400">Total Budget</th>
                                    <th className="p-4 text-sm font-semibold text-gray-400">Spent</th>
                                    <th className="p-4 text-sm font-semibold text-gray-400">Progress</th>
                                    <th className="p-4 text-sm font-semibold text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800">
                                {budgets.map(budget => {
                                    const progress = budget.totalBudget > 0 ? ((budget.spent || 0) / budget.totalBudget) * 100 : 0;
                                    return (
                                        <tr key={budget.id} className="hover:bg-gray-800/60 transition-colors">
                                            <td className="p-4 font-medium text-white">{budget.name}</td>
                                            <td className="p-4 text-gray-300">{budget.branch}</td>
                                            <td className="p-4 text-gray-300">R {budget.totalBudget?.toLocaleString() || 0}</td>
                                            <td className="p-4 text-yellow-300">R {budget.spent?.toLocaleString() || 0}</td>
                                            <td className="p-4">
                                                <div className="w-full bg-gray-700 rounded-full h-2.5">
                                                    <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex gap-4">
                                                    <button onClick={() => handleEditClick(budget)} className="text-gray-400 hover:text-white" aria-label={`Edit ${budget.name}`}><Edit className="w-4 h-4" /></button>
                                                    <button onClick={() => handleDeleteClick(budget.id)} className="text-gray-400 hover:text-red-400" aria-label={`Delete ${budget.name}`}><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </td>
                                      </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </main>
                <BudgetEditorModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveBudget} budgetToEdit={budgetToEdit} isSaving={isSaving} />
                <ConfirmationModal
                    isOpen={isConfirmOpen}
                    onClose={() => setConfirmOpen(false)}
                    onConfirm={confirmDelete}
                    message="Are you sure you want to delete this budget entry?" />
            </div>
        </div>
    );
}