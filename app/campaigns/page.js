"use client";
import React, { useState, useEffect, useRef } from "react";
import Sidebar from "../components/Sidebar";
import { useAppContext } from "../context/AppContext";
import Link from 'next/link';

// --- ICONS --- //
const Plus = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14" /><path d="M12 5v14" /></svg>;
const List = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="2" y1="6" x2="22" y2="6" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="18" x2="22" y2="18" /></svg>;
const Trello = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><rect width="8" height="7" x="7" y="7" rx="2" ry="2" /><rect width="8" height="7" x="13" y="13" rx="2" ry="2" /></svg>;

// --- CONFIG --- //
const BRANCHES = ["Alberton", "Vanderbijlpark", "Sasolburg", "National"];
const KANBAN_COLUMNS = ["Planning", "In Progress", "Live", "Completed"];
const statusConfig = { Planning: { color: "blue", bg: "bg-blue-900/50", text: "text-blue-400" }, "In Progress": { color: "yellow", bg: "bg-yellow-900/50", text: "text-yellow-400" }, Live: { color: "green", bg: "bg-green-900/50", text: "text-green-400" }, Completed: { color: "gray", bg: "bg-gray-800", text: "text-gray-400" },};
const AD_FORMATS = ["1:1", "4:5", "9:16"];
const OBJECTIVES = ["Sales", "Leads", "Brand Awareness", "Engagement"];

// --- REUSABLE COMPONENTS --- //
const CampaignEditorModal = ({ isOpen, onClose, onSave, campaignToEdit, budgets }) => {
  const [name, setName] = useState("");
  const [branch, setBranch] = useState(BRANCHES[0]);
  const [objective, setObjective] = useState(OBJECTIVES[0]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [primaryText, setPrimaryText] = useState("");
  const [headlines, setHeadlines] = useState([""]);
  const [visuals, setVisuals] = useState({ "1:1": null, "4:5": null, "9:16": null });
  const [targetValue, setTargetValue] = useState("");
  const [budgetId, setBudgetId] = useState(""); // NEW: State for linked budget

  useEffect(() => {
    if (campaignToEdit) {
      setName(campaignToEdit.name || "");
      setBranch(campaignToEdit.branch || BRANCHES[0]);
      setObjective(campaignToEdit.objective || OBJECTIVES[0]);
      setStartDate(campaignToEdit.startDate || "");
      setEndDate(campaignToEdit.endDate || "");
      setPrimaryText(campaignToEdit.primaryText || "");
      setHeadlines(campaignToEdit.headlines || [""]);
      setVisuals(campaignToEdit.visuals || { "1:1": null, "4:5": null, "9:16": null });
      setTargetValue(campaignToEdit.targetValue || "");
      setBudgetId(campaignToEdit.budgetId || ""); // NEW: Set budget ID
    } else {
      setName(""); setBranch(BRANCHES[0]); setObjective(OBJECTIVES[0]); setStartDate(""); setEndDate(""); setPrimaryText(""); setHeadlines([""]); setVisuals({ "1:1": null, "4:5": null, "9:16": null }); setTargetValue(""); setBudgetId("");
    }
  }, [campaignToEdit]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    // Automatically determine checklist status on save
    const checklist = {
        primaryText: !!primaryText,
        headlines: headlines.some(h => h),
        visuals: Object.values(visuals).some(v => v),
        targeting: !!targetValue,
        budget: !!budgetId, // NEW: Checklist depends on budgetId
    };

    const savedCampaign = {
      ...campaignToEdit,
      id: campaignToEdit ? campaignToEdit.id : undefined,
      name, branch, objective, startDate, endDate, primaryText, headlines, visuals,
      targetValue: parseFloat(targetValue),
      budgetId, // NEW: Save the linked budget ID
      checklist,
      status: campaignToEdit ? campaignToEdit.status : "Planning",
    };
    onSave(savedCampaign);
    onClose();
  };

  // Visual upload logic remains the same
  const handleVisualUpload = (format, e) => {
    const file = e.target.files[0];
    if (file) {
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
      <div className="bg-gray-900 border border-gray-800 w-full max-w-lg rounded-xl shadow-2xl m-4 p-6">
        <form onSubmit={handleSubmit}>
          <div className="flex items-center justify-between border-b border-gray-800 pb-4"><h3 className="text-xl font-semibold text-white">{campaignToEdit ? "Edit Campaign" : "Create New Campaign"}</h3><button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-xl">&times;</button></div>
          <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {/* All other form fields remain the same */}
            <div><label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Campaign Name</label><input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white" /></div>
            
            {/* NEW: Budget Selector */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="branch" className="block text-sm font-medium text-gray-300 mb-1">Branch</label>
                    <select id="branch" value={branch} onChange={(e) => setBranch(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white">{BRANCHES.map((b) => (<option key={b} value={b}>{b}</option>))}</select>
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
            <div><label className="block text-sm font-medium text-gray-300 mb-1">Visuals (Local Preview)</label>{AD_FORMATS.map((format) => (<div key={format} className="mb-2"><label className="block text-sm text-gray-400">{format} Visual</label><input type="file" accept="image/*" onChange={(e) => handleVisualUpload(format, e)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white" />{visuals[format] && (<img src={visuals[format]} alt={`${format} visual`} className="w-32 h-32 object-cover mt-2" />)}</div>))}</div>
            <div><label htmlFor="targetValue" className="block text-sm font-medium text-gray-300 mb-1">Target Value</label><input type="number" id="targetValue" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white" /></div>
          </div>
          <div className="flex items-center justify-end border-t border-gray-800 pt-4 space-x-2"><button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-gray-700 text-white rounded-lg hover:bg-gray-600">Cancel</button><button type="submit" className="px-4 py-2 text-sm font-medium bg-yellow-400 text-gray-950 rounded-lg hover:bg-yellow-300">Save Campaign</button></div>
        </form>
      </div>
    </div>
  );
};

const CampaignListView = ({ campaigns, onEdit, onDelete }) => (
    <div className="bg-gray-900 p-5 border border-gray-800 rounded-xl flex-1 overflow-auto">
        <table className="w-full text-left">
            <thead><tr className="border-b border-gray-800"><th className="p-4 text-sm font-semibold text-gray-400">Name</th><th className="p-4 text-sm font-semibold text-gray-400">Branch</th><th className="p-4 text-sm font-semibold text-gray-400">Objective</th><th className="p-4 text-sm font-semibold text-gray-400">Status</th><th className="p-4 text-sm font-semibold text-gray-400">Progress</th><th className="p-4 text-sm font-semibold text-gray-400">Actions</th></tr></thead>
            <tbody>
                {campaigns.map((campaign) => {
                    const progress = campaign.checklist ? (Object.values(campaign.checklist).filter(Boolean).length / Object.keys(campaign.checklist).length) * 100 : 0;
                    return (
                        <tr key={campaign.id} className="border-b border-gray-800 hover:bg-gray-800/60">
                            <td className="p-4 font-medium text-white"><Link href={`/campaigns/${campaign.id}`} className="hover:text-yellow-400">{campaign.name}</Link></td>
                            <td className="p-4 text-sm text-gray-400">{campaign.branch}</td>
                            <td className="p-4 text-sm text-gray-400">{campaign.objective}</td>
                            <td className="p-4"><span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[campaign.status]?.text}`}>{campaign.status}</span></td>
                            <td className="p-4"><div className="w-24 bg-gray-700 rounded-full h-2.5"><div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div></div></td>
                            <td className="p-4 flex gap-2"><button onClick={() => onEdit(campaign)} className="text-yellow-400 hover:text-yellow-300">Edit</button><button onClick={() => onDelete(campaign.id)} className="text-red-400 hover:text-red-300">Delete</button></td>
                        </tr>
                    );
                })}
            </tbody>
        </table>
    </div>
);

const CampaignKanbanView = ({ campaigns, onDragStart, onDrop, draggedCampaign }) => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 flex-1 overflow-auto">
        {KANBAN_COLUMNS.map((status) => (
            <div key={status} onDragOver={(e) => e.preventDefault()} onDrop={(e) => onDrop(e, status)} className={`p-4 border border-dashed rounded-xl flex flex-col ${draggedCampaign && draggedCampaign.status !== status ? "border-yellow-400" : "border-transparent"} bg-gray-900/70`}>
                <h3 className="text-lg font-semibold text-white mb-4">{status}</h3>
                <div className="space-y-4 overflow-y-auto flex-1">
                    {campaigns.filter((c) => c.status === status).map((campaign) => {
                        const progress = campaign.checklist ? (Object.values(campaign.checklist).filter(Boolean).length / Object.keys(campaign.checklist).length) * 100 : 0;
                        return (
                            <div key={campaign.id} draggable onDragStart={(e) => onDragStart(e, campaign)} className="bg-gray-800 p-4 rounded-lg border border-gray-700 cursor-grab active:cursor-grabbing">
                                <div className="flex justify-between items-start mb-2"><p className="font-semibold text-white pr-4">{campaign.name}</p><span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[campaign.status]?.text}`}>{campaign.branch}</span></div>
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

// --- MAIN PAGE COMPONENT --- //
export default function CampaignsPage() {
  const { campaigns, budgets, saveData, deleteData, loading } = useAppContext();
  const [isModalOpen, setModalOpen] = useState(false);
  const [campaignToEdit, setCampaignToEdit] = useState(null);
  const [view, setView] = useState("list");
  const [draggedCampaign, setDraggedCampaign] = useState(null);

  const handleSaveCampaign = async (savedCampaign) => {
    await saveData('campaigns', savedCampaign);
    setModalOpen(false);
  };

  const handleAddClick = () => {
    setCampaignToEdit(null);
    setModalOpen(true);
  };

  const handleEditClick = (campaign) => {
    setCampaignToEdit(campaign);
    setModalOpen(true);
  };

  const handleDeleteClick = async (id) => {
    if (window.confirm("Are you sure? This will delete the campaign and all its data.")) {
      await deleteData('campaigns', id);
    }
  };

  const handleDragStart = (e, campaign) => {
    setDraggedCampaign(campaign);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (draggedCampaign) {
      const updatedCampaign = { ...draggedCampaign, status: newStatus };
      await saveData('campaigns', updatedCampaign);
      setDraggedCampaign(null);
    }
  };

  if (loading) { return ( <div className="flex h-screen bg-gray-950 text-white items-center justify-center">Loading Campaigns...</div> )}

  return (
    <div className="font-sans antialiased text-gray-200">
      <div className="flex h-screen bg-gray-950">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col">
          <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-white">Campaigns</h2>
              <p className="text-gray-400 mt-1">Manage your Facebook ad campaigns across all stores.</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleAddClick} className="px-5 py-2.5 text-sm font-semibold text-gray-950 bg-yellow-400 rounded-lg hover:bg-yellow-300 transition-colors flex items-center gap-2">
                <Plus className="w-5 h-5" /> Create Campaign
              </button>
            </div>
          </header>
          <div className="flex items-center bg-gray-800 rounded-lg p-1 mb-8 w-min">
            <button onClick={() => setView("list")} className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 ${view === "list" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"}`}>
              <List className="w-4 h-4" /> List
            </button>
            <button onClick={() => setView("kanban")} className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 ${view === "kanban" ? "bg-gray-700 text-white" : "text-gray-400 hover:text-white"}`}>
              <Trello className="w-4 h-4" /> Kanban
            </button>
          </div>
          {view === "list" ? (
            <CampaignListView campaigns={campaigns} onEdit={handleEditClick} onDelete={handleDeleteClick} />
          ) : (
            <CampaignKanbanView campaigns={campaigns} onDragStart={handleDragStart} onDrop={handleDrop} draggedCampaign={draggedCampaign} />
          )}
          <CampaignEditorModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveCampaign} campaignToEdit={campaignToEdit} budgets={budgets} />
        </main>
      </div>
    </div>
  );
}
