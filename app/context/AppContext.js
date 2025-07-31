// app/context/AppContext.js
"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // We'll need a library to create unique IDs

// --- Hardcoded Initial Data for Development ---
// This data will be used to populate the app on first load.
const initialData = {
  campaigns: [
    {
      id: 'camp-1',
      name: 'Summer Sale Kickoff',
      branch: 'National',
      objective: 'Sales',
      startDate: '2024-08-01',
      endDate: '2024-08-15',
      primaryText: 'Get ready for the hottest deals of the summer!',
      headlines: ['50% Off Everything!', 'Limited Time Only'],
      visuals: { "1:1": null, "4:5": null, "9:16": null },
      targetValue: 50000,
      budgetId: 'budget-1',
      status: 'Planning',
      checklist: { primaryText: true, headlines: true, visuals: false, targeting: true, budget: true },
    },
     {
      id: 'camp-2',
      name: 'New Branch Opening',
      branch: 'Alberton',
      objective: 'Brand Awareness',
      startDate: '2024-09-01',
      endDate: '2024-09-30',
      primaryText: 'Come visit our new Alberton location!',
      headlines: ['Grand Opening Specials', 'Free Gifts for First 100 Customers'],
      visuals: { "1:1": null, "4:5": null, "9:16": null },
      targetValue: 10000,
      budgetId: 'budget-2',
      status: 'In Progress',
      checklist: { primaryText: true, headlines: true, visuals: false, targeting: true, budget: true },
    }
  ],
  tasks: [
    { id: 'task-1', text: 'Design visuals for Summer Sale', priority: 'High', campaign: 'Summer Sale Kickoff', campaignId: 'camp-1', status: 'To Do' },
    { id: 'task-2', text: 'Write ad copy for Alberton opening', priority: 'Medium', campaign: 'New Branch Opening', campaignId: 'camp-2', status: 'In Progress' },
    { id: 'task-3', text: 'Finalize budget allocation', priority: 'High', campaign: 'Summer Sale Kickoff', campaignId: 'camp-1', status: 'Done' },
  ],
  notes: [
    { id: 'note-1', title: 'Q3 Marketing Ideas', content: '- Focus on video content\n- Collaborate with local influencers', color: 'bg-blue-900/80', createdAt: new Date().toISOString() },
    { id: 'note-2', title: 'Competitor Ad Analysis', content: 'Competitor X is running a big campaign on Facebook. Need to monitor their creatives.', color: 'bg-yellow-900/80', createdAt: new Date().toISOString() },
  ],
  budgets: [
     { id: 'budget-1', name: 'Summer Sale Kickoff', branch: 'National', totalBudget: 25000, dailyBudget: 1666, spent: 0, status: 'Planning', startDate: '2024-08-01' },
     { id: 'budget-2', name: 'Alberton Grand Opening', branch: 'Alberton', totalBudget: 15000, dailyBudget: 500, spent: 1200, status: 'Live', startDate: '2024-09-01' },
  ],
};


const AppContext = createContext();

export function AppProvider({ children }) {
  const [campaigns, setCampaigns] = useState(initialData.campaigns);
  const [tasks, setTasks] = useState(initialData.tasks);
  const [notes, setNotes] = useState(initialData.notes);
  const [budgets, setBudgets] = useState(initialData.budgets);
  
  // Since we are not fetching data, loading is always false.
  const [loading, setLoading] = useState(false);

  // This function will now update our local state instead of Firestore.
  const saveData = (collectionName, data) => {
    const dataToSave = { ...data };
    const stateUpdater = {
      campaigns: setCampaigns,
      tasks: setTasks,
      notes: setNotes,
      budgets: setBudgets,
    }[collectionName];

    if (!stateUpdater) return;

    stateUpdater(prevData => {
      if (dataToSave.id) {
        // Update existing item
        return prevData.map(item => item.id === dataToSave.id ? dataToSave : item);
      } else {
        // Add new item with a unique ID
        dataToSave.id = uuidv4();
        return [...prevData, dataToSave];
      }
    });
  };

  // This function will now delete from our local state.
  const deleteData = (collectionName, id) => {
    const stateUpdater = {
      campaigns: setCampaigns,
      tasks: setTasks,
      notes: setNotes,
      budgets: setBudgets,
    }[collectionName];

    if (!stateUpdater) return;

    stateUpdater(prevData => prevData.filter(item => item.id !== id));
  };

  // We remove uploadFile as it's a backend-specific function.
  // Visuals will be handled as local previews.

  const value = {
    campaigns,
    tasks,
    notes,
    budgets,
    setCampaigns, // Keep setters for import/export functionality
    setTasks,
    setNotes,
    setBudgets,
    loading,
    saveData,
    deleteData,
    // uploadFile is removed
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
