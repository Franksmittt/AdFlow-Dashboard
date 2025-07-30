"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppContext } from "../../context/AppContext";
import Sidebar from "../../components/Sidebar";
import CreativeChecklist from "../../components/campaigns/CreativeChecklist";
import VisualManager from "../../components/campaigns/VisualManager";
import CopyManager from "../../components/campaigns/CopyManager";

// --- CONFIG --- //
const statusConfig = {
    "Planning": { bg: "bg-blue-900/50", text: "text-blue-300" },
    "In Progress": { bg: "bg-yellow-900/50", text: "text-yellow-300" },
    "Live": { bg: "bg-green-900/50", text: "text-green-300" },
    "Completed": { bg: "bg-gray-800", text: "text-gray-400" },
};

// --- WIDGET COMPONENTS --- //
// NOTE: For better maintainability, these could be moved to separate files.

const CampaignOverview = ({ campaign }) => (
  <div className="bg-gray-800/50 border border-gray-800 p-6 rounded-xl">
    <div className="flex justify-between items-start">
      <div>
        <h2 className="text-2xl font-bold text-white">{campaign.name}</h2>
        <p className="text-gray-400 mt-1">{campaign.objective} • {campaign.branch}</p>
        <p className="text-sm text-gray-500 mt-2">Timeline: {campaign.startDate} → {campaign.endDate}</p>
      </div>
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusConfig[campaign.status]?.bg} ${statusConfig[campaign.status]?.text}`}>
        {campaign.status}
      </span>
    </div>
  </div>
);

const AdCreativeHub = ({ campaign, onCampaignUpdate }) => (
  <div className="space-y-6">
    <CreativeChecklist campaign={campaign} />
    <VisualManager campaign={campaign} onSave={onCampaignUpdate} />
    <CopyManager campaign={campaign} onSave={onCampaignUpdate} />
  </div>
);

const LinkedTasks = ({ campaignId, tasks }) => {
    // ✅ FIX: Now correctly filters tasks by the unique `campaignId`.
    const campaignTasks = tasks.filter(task => task.campaignId === campaignId);

    return (
        <div className="bg-gray-800/50 border border-gray-800 p-6 rounded-xl">
          <h3 className="text-xl font-semibold text-white mb-4">✅ Linked Tasks</h3>
          {campaignTasks.length > 0 ? (
            <ul className="space-y-2">
                {campaignTasks.map(task => (
                    <li key={task.id} className="text-gray-300 bg-gray-900/50 p-3 rounded-md text-sm">{task.text}</li>
                ))}
            </ul>
          ) : (
            <p className="text-gray-500 text-sm">No tasks linked to this campaign yet.</p>
          )}
        </div>
    );
};

// --- MAIN PAGE COMPONENT --- //
export default function CampaignDetailPage() {
  const { campaigns, tasks, saveData, loading } = useAppContext();
  const params = useParams();
  const router = useRouter(); 

  // Find the campaign using the unique ID from the URL
  const campaign = campaigns.find((c) => c.id === params.id);

  const handleCampaignUpdate = async (updatedData) => {
    if (!campaign) return;
    try {
        const campaignToSave = { ...campaign, ...updatedData };
        await saveData('campaigns', campaignToSave);
    } catch (error) {
        console.error("Error updating campaign:", error);
        alert("Failed to update campaign. Please check the console for details.");
    }
  };

  if (loading) {
    return (
        <div className="flex h-screen bg-gray-950 text-white items-center justify-center">
            <p>Loading Campaign Details...</p>
        </div>
    )
  }

  if (!campaign) {
    return (
        <div className="flex h-screen bg-gray-950">
            <Sidebar />
            <main className="flex-1 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-white">Campaign Not Found</h2>
                    <button onClick={() => router.push('/campaigns')} className="mt-4 px-4 py-2 bg-yellow-400 text-gray-950 rounded-lg hover:bg-yellow-300 transition-colors">
                        Back to All Campaigns
                    </button>
                </div>
            </main>
      </div>
    );
  }

  return (
    <div className="font-sans antialiased text-gray-200">
      <div className="flex h-screen bg-gray-950">
        <Sidebar />
        <main className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col gap-6 overflow-y-auto">
          <header>
             <button onClick={() => router.back()} className="text-sm text-yellow-400 hover:text-yellow-300 mb-2">
                &larr; Back to Campaigns
             </button>
            <h1 className="text-3xl font-bold text-white">Campaign: {campaign.name}</h1>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3">
              <CampaignOverview campaign={campaign} />
            </div>

            <div className="lg:col-span-2">
              <AdCreativeHub campaign={campaign} onCampaignUpdate={handleCampaignUpdate} />
            </div>

            <div className="lg:col-span-1">
                {/* ✅ FIX: Passing the unique `campaign.id` to the component. */}
                <LinkedTasks campaignId={campaign.id} tasks={tasks} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}