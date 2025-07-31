// app/campaigns/CampaignClientView.js
"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import Image from 'next/image';
import Sidebar from "../components/Sidebar";
import { useAppContext } from "../context/AppContext";
import toast from 'react-hot-toast';
import { z } from 'zod';
// CHANGE: Import the new accessible hook
import { useAccessibleKanban } from '../hooks/useAccessibleKanban';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import { Plus, List, Trello } from '../components/icons';


const BRANCHES = ["Alberton", "Vanderbijlpark", "Sasolburg", "National"];
const KANBAN_COLUMNS = ["Planning", "In Progress", "Live", "Completed"];
const statusConfig = {
    Planning: { color: "blue", bg: "bg-blue-900/50", text: "text-blue-400" },
    "In Progress": { color: "yellow", bg: "bg-yellow-900/50", text: "text-yellow-400" },
    Live: { color: "green", bg: "bg-green-900/50", text: "text-green-400" },
    Completed: { color: "gray", bg: "bg-gray-800", text: "text-gray-400" },
};
const OBJECTIVES = ["Sales", "Leads", "Brand Awareness", "Engagement"];
const campaignSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "Campaign name is required." }),
  branch: z.enum(BRANCHES),
  objective: z.enum(OBJECTIVES),
  startDate: z.string().min(1, { message: "Start date is required." }),
  endDate: z.string().min(1, { message: "End date is required." }),
  primaryText: z.string().optional(),
  headlines: z.array(z.string()),
  visuals: z.object({
    "1:1": z.string().nullable(),
    "4:5": z.string().nullable(),
    "9:16": z.string().nullable(),
  }),
  targetValue: z.number().min(0).optional(),
  budgetId: z.string().optional(),
  status: z.enum(KANBAN_COLUMNS),
  checklist: z.object({
    primaryText: z.boolean(),
    headlines: z.boolean(),
    visuals: z.boolean(),
    targeting: z.boolean(),
    budget: z.boolean(),
  }),
});

// --- SUB-COMPONENTS --- //
const CampaignEditorModal = ({ isOpen, onClose, onSave, campaignToEdit, budgets }) => {
    // This component remains unchanged from its original version.
    const [name, setName] = useState("");
    const [branch, setBranch] = useState(BRANCHES[0]);
    const [objective, setObjective] = useState(OBJECTIVES[0]);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [primaryText, setPrimaryText] = useState("");
    const [headlines, setHeadlines] = useState([""]);
    const [visuals, setVisuals] = useState({ "1:1": null, "4:5": null, "9:16": null });
    const [targetValue, setTargetValue] = useState("");
    const [budgetId, setBudgetId] = useState("");
    const modalRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            if (campaignToEdit) {
                setName(campaignToEdit.name || "");
                setBranch(campaignToEdit.branch || BRANCHES[0]);
                setObjective(campaignToEdit.objective || OBJECTIVES[0]);
                setStartDate(campaignToEdit.startDate || "");
                setEndDate(campaignToEdit.endDate || "");
                setPrimaryText(campaignToEdit.primaryText || "");
                setHeadlines(campaignToEdit.headlines?.length ? campaignToEdit.headlines : [""]);
                setVisuals(campaignToEdit.visuals || { "1:1": null, "4:5": null, "9:16": null });
                setTargetValue(campaignToEdit.targetValue || "");
                setBudgetId(campaignToEdit.budgetId || "");
            } else {
                setName(""); setBranch(BRANCHES[0]); setObjective(OBJECTIVES[0]); setStartDate(""); setEndDate(""); setPrimaryText(""); setHeadlines([""]); setVisuals({ "1:1": null, "4:5": null, "9:16": null }); setTargetValue(""); setBudgetId("");
            }
            if (modalRef.current) {
                modalRef.current.focus();
            }
        }
    }, [campaignToEdit, isOpen]);

    useEffect(() => {
        return () => {
            Object.values(visuals).forEach(url => {
                if (url && url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [visuals]);
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const checklist = {
            primaryText: !!primaryText, headlines: headlines.some(h => h.trim() !== ''),
            visuals: Object.values(visuals).some(v => v), targeting: !!targetValue, budget: !!budgetId,
        };
        const savedCampaign = {
            ...campaignToEdit, id: campaignToEdit?.id, name, branch, objective,
            startDate, endDate, primaryText, headlines: headlines.filter(h => h.trim() !== ''), visuals,
            targetValue: parseFloat(targetValue) || 0, budgetId, checklist,
            status: campaignToEdit?.status || "Planning",
        };

        const result = campaignSchema.safeParse(savedCampaign);
        if (!result.success) {
            const errorMessages = result.error.errors.map(err => err.message).join('\n');
            toast.error(`Validation failed:\n${errorMessages}`);
            return;
        }

        onSave(result.data);
        onClose();
    };
    const handleVisualUpload = (format, e) => {
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
            if (!allowedTypes.includes(file.type)) {
                toast.error(`Unsupported file type for ${format}. Please use JPEG, PNG, GIF, or MP4/MOV.`);
                return;
            }
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                toast.error(`File size exceeds 10MB limit for ${format}.`);
                return;
            }
            setVisuals((prev) => ({ ...prev, [format]: URL.createObjectURL(file) }));
        }
    };

    const addHeadline = () => setHeadlines((prev) => [...prev, ""]);
    const updateHeadline = (index, value) => {
        const newHeadlines = [...headlines];
        newHeadlines[index] = value;
        setHeadlines(newHeadlines);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div ref={modalRef} tabIndex="-1" className="bg-gray-900 border border-gray-800 w-full max-w-lg rounded-xl shadow-2xl m-4" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center justify-between p-6 border-b border-gray-800">
                        <h3 className="text-xl font-semibold text-white">{campaignToEdit ? "Edit Campaign" : "Create New Campaign"}</h3>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none" aria-label="Close modal">&times;</button>
                    </div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div><label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Campaign Name</label><input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white" /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="branch" className="block text-sm font-medium text-gray-300 mb-1">Branch</label>
                                <select id="branch" value={branch} onChange={(e) => setBranch(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white">{BRANCHES.map((b) => (<option key={b} value={b}>{b}</option>))}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="budget" className="block text-sm font-medium text-gray-300 mb-1">Link Budget</label>
                                <select id="budget" value={budgetId} onChange={(e) => setBudgetId(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white">
                                    <option value="">No Budget Linked</option>
                                    {budgets.map((b) => (<option key={b.id} value={b.id}>{b.name} (R{b.totalBudget})</option>))}
                                </select>
                            </div>
                        </div>
                        <div><label htmlFor="objective" className="block text-sm font-medium text-gray-300 mb-1">Objective</label><select id="objective" value={objective} onChange={(e) => setObjective(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white">{OBJECTIVES.map((o) => (<option key={o} value={o}>{o}</option>))}</select></div>
                        <div className="grid grid-cols-2 gap-4"><div><label htmlFor="startDate" className="block text-sm font-medium text-gray-300 mb-1">Start Date</label><input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} required className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white" /></div><div><label htmlFor="endDate" className="block text-sm font-medium text-gray-300 mb-1">End Date</label><input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} required className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white" /></div></div>
                        <div><label htmlFor="primaryText" className="block text-sm font-medium text-gray-300 mb-1">Primary Text</label><textarea id="primaryText" value={primaryText} onChange={(e) => setPrimaryText(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white" rows="4" /></div>
                        <div><label className="block text-sm font-medium text-gray-300 mb-1">Headlines</label>{headlines.map((headline, index) => (<input key={index} type="text" value={headline} onChange={(e) => updateHeadline(index, e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white mb-2" placeholder={`Headline ${index + 1}`} />))}<button type="button" onClick={addHeadline} className="text-yellow-400 hover:text-yellow-300 text-sm">+ Add Headline</button></div>
                        <div><label className="block text-sm font-medium text-gray-300 mb-1">Visuals (Local Preview)</label>{AD_FORMATS.map((format) => (<div key={format} className="mb-2"><label className="block text-sm text-gray-400">{format} Visual</label><input type="file" accept="image/*,video/*" onChange={(e) => handleVisualUpload(format, e)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white" /><div className="relative w-32 h-32 mt-2">{visuals[format] && (<Image src={visuals[format]} alt={`${format} visual`} fill className="object-cover rounded-md" />)}</div></div>))}</div>
                        <div><label htmlFor="targetValue" className="block text-sm font-medium text-gray-300 mb-1">Target Value</label><input type="number" id="targetValue" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white" /></div>
                    </div>
                    <div className="flex items-center justify-end p-6 border-t border-gray-800 space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-gray-700 text-white rounded-lg hover:bg-gray-600">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium bg-yellow-400 text-gray-950 rounded-lg hover:bg-yellow-300">Save Campaign</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CampaignListView = ({ campaigns, onEdit, onDelete }) => (
    <div className="bg-gray-900/70 border border-gray-800 rounded-xl flex-1 overflow-auto">
        <table className="w-full text-left">
            <thead className="sticky top-0 bg-gray-900/70 backdrop-blur-sm">
                <tr className="border-b border-gray-800"><th className="p-4 text-sm font-semibold text-gray-400">Name</th><th className="p-4 text-sm font-semibold text-gray-400">Branch</th><th className="p-4 text-sm font-semibold text-gray-400">Objective</th><th className="p-4 text-sm font-semibold text-gray-400">Status</th><th className="p-4 text-sm font-semibold text-gray-400">Progress</th><th className="p-4 text-sm font-semibold text-gray-400">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
                {campaigns.map((campaign) => {
                    const progress = campaign.checklist ? (Object.values(campaign.checklist).filter(Boolean).length / Object.keys(campaign.checklist).length) * 100 : 0;
                    return (
                        <tr key={campaign.id} className="hover:bg-gray-800/60 transition-colors">
                            <td className="p-4 font-medium text-white"><Link href={`/campaigns/${campaign.id}`} className="hover:text-yellow-400 transition-colors">{campaign.name}</Link></td>
                            <td className="p-4 text-sm text-gray-400">{campaign.branch}</td>
                            <td className="p-4 text-sm text-gray-400">{campaign.objective}</td>
                            <td className="p-4"><span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[campaign.status]?.text} ${statusConfig[campaign.status]?.bg}`}>{campaign.status}</span></td>
                            <td className="p-4"><div className="w-24 bg-gray-700 rounded-full h-2.5"><div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div></div></td>
                            <td className="p-4">
                                <div className="flex gap-4">
                                    <button onClick={() => onEdit(campaign)} className="text-gray-400 hover:text-yellow-300 transition-colors" aria-label={`Edit ${campaign.name}`}>Edit</button>
                                    <button onClick={() => onDelete(campaign.id)} className="text-gray-400 hover:text-red-400 transition-colors" aria-label={`Delete ${campaign.name}`}>Delete</button>
                                </div>
                            </td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
);

// UPDATE: CampaignKanbanView now uses keyboard accessibility props
const CampaignKanbanView = ({ campaigns, onDragStart, onDrop, onKeyDown, draggedItem, keyboardSelectedItem }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 flex-1 overflow-y-auto">
        {KANBAN_COLUMNS.map((status) => (
            <div key={status} onDragOver={(e) => e.preventDefault()} onDrop={(e) => onDrop(e, status)} className={`p-4 border-2 border-dashed rounded-xl flex flex-col transition-colors ${draggedItem && draggedItem.status !== status ? "border-yellow-400/50" : "border-transparent"} bg-gray-900/70`}>
                <h3 className="text-lg font-semibold text-white mb-4">{status}</h3>
                <div className="space-y-4 overflow-y-auto flex-1">
                    {campaigns.filter((c) => c.status === status).map((campaign) => {
                        const progress = campaign.checklist ? (Object.values(campaign.checklist).filter(Boolean).length / Object.keys(campaign.checklist).length) * 100 : 0;
                        return (
                             <div 
                                key={campaign.id} 
                                draggable 
                                onDragStart={(e) => onDragStart(e, campaign)}
                                onKeyDown={(e) => onKeyDown(e, campaign)}
                                tabIndex={0}
                                className={`bg-gray-800 p-4 rounded-lg border border-gray-700 cursor-grab active:cursor-grabbing transition-all ${draggedItem?.id === campaign.id ? 'opacity-50' : 'opacity-100'} ${keyboardSelectedItem?.id === campaign.id ? 'ring-2 ring-yellow-400' : 'focus:ring-2 focus:ring-blue-400'}`}
                                role="button"
                                aria-roledescription="Draggable campaign"
                                aria-grabbed={keyboardSelectedItem?.id === campaign.id}
                            >
                                <div className="flex justify-between items-start mb-2"><p className="font-semibold text-white pr-4">{campaign.name}</p><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[campaign.status]?.bg} ${statusConfig[campaign.status]?.text}`}>{campaign.branch}</span></div>
                                <p className="text-sm text-gray-400">{campaign.objective}</p>
                                <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2"><div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div></div>
                            </div>
                        );
                    })}
                </div>
            </div>
        ))}
    </div>
);
// --- MAIN CLIENT COMPONENT --- //
export default function CampaignClientView({ initialCampaigns, initialBudgets }) {
    const { campaigns, budgets, saveData, deleteData, loading } = useAppContext();
    const [isModalOpen, setModalOpen] = useState(false);
    const [campaignToEdit, setCampaignToEdit] = useState(null);
    const [view, setView] = useState("list");
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const [campaignToDelete, setCampaignToDelete] = useState(null);
    
    // CHANGE: Use the new accessible hook
    const { 
        draggedItem, 
        keyboardSelectedItem,
        handleDragStart, 
        handleDrop, 
        handleKeyDown 
    } = useAccessibleKanban({ saveData, collectionName: 'campaigns', columns: KANBAN_COLUMNS });


    const handleSaveCampaign = async (savedCampaign) => {
        try {
            await toast.promise(
                saveData('campaigns', savedCampaign),
                {
                    loading: 'Saving campaign...',
                    success: 'Campaign saved successfully!',
                    error: 'Failed to save campaign.',
                }
            );
            setModalOpen(false);
        } catch (error) {
            console.error("Error saving campaign:", error);
        }
    };

    const handleAddClick = () => { setCampaignToEdit(null); setModalOpen(true); };
    const handleEditClick = (campaign) => { setCampaignToEdit(campaign); setModalOpen(true); };

    const handleDeleteClick = (id) => {
        setCampaignToDelete(id);
        setConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!campaignToDelete) return;
        try {
            await deleteData('campaigns', campaignToDelete);
            toast.success('Campaign deleted successfully!');
        } catch (error) {
            toast.error('Failed to delete campaign.');
            console.error("Error deleting campaign:", error);
        } finally {
            setConfirmOpen(false);
            setCampaignToDelete(null);
        }
    };

    if (loading) {
        // Loading skeleton remains the same...
        return (
            <div className="flex h-screen bg-gray-950">
                <Sidebar />
                <main className="flex-1 flex items-center justify-center text-white">
                    <p>Loading Campaigns...</p>
                </main>
            </div>
        );
    }

    return (
        <div className="font-sans antialiased text-gray-200">
            <div className="flex h-screen bg-gray-950">
                <Sidebar />
                <main className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col">
                    <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 flex-shrink-0">
                        <div>
                            <h2 className="text-3xl font-bold text-white">Campaigns</h2>
                            <p className="text-gray-400 mt-1">Manage your Facebook ad campaigns across all stores.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleAddClick} className="px-5 py-2.5 text-sm font-semibold text-gray-950 bg-yellow-400 rounded-lg hover:bg-yellow-300 transition-colors flex items-center gap-2" aria-label="Create New Campaign">
                                <Plus className="w-5 h-5" /> Create Campaign
                            </button>
                        </div>
                    </header>
                    <div className="flex items-center bg-gray-800 rounded-lg p-1 mb-8 w-min flex-shrink-0">
                        <button onClick={() => setView("list")} className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${view === "list" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"}`} aria-label="View as List">
                            <List className="w-4 h-4" /> List
                        </button>
                        <button onClick={() => setView("kanban")} className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 transition-colors ${view === "kanban" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"}`} aria-label="View as Kanban Board">
                            <Trello className="w-4 h-4" /> Kanban
                        </button>
                    </div>
                    {view === "list" ? (
                        <CampaignListView campaigns={campaigns} onEdit={handleEditClick} onDelete={handleDeleteClick} />
                    ) : (
                        // UPDATE: Pass new props to the Kanban view
                        <CampaignKanbanView 
                            campaigns={campaigns} 
                            onDragStart={handleDragStart} 
                            onDrop={handleDrop}
                            onKeyDown={handleKeyDown}
                            draggedItem={draggedItem}
                            keyboardSelectedItem={keyboardSelectedItem}
                        />
                    )}
                    <CampaignEditorModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveCampaign} campaignToEdit={campaignToEdit} budgets={budgets} />
                    <ConfirmationModal
                        isOpen={isConfirmOpen}
                        onClose={() => setConfirmOpen(false)}
                        onConfirm={confirmDelete}
                        message="Are you sure you want to delete this campaign?" />
                </main>
            </div>
        </div>
    );
}