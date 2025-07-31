// app/context/AppContext.js
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

// — Firebase Storage imports —
import { storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// --- Hardcoded Initial Data for Development ---
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
      status: 'Completed',
      checklist: { primaryText: true, headlines: true, visuals: false, targeting: true, budget: true },
    }
  ],
  tasks: [
    { id: 'task-1', text: 'Design visuals for Summer Sale', campaignName: 'Summer Sale Kickoff', campaignId: 'camp-1', status: 'To Do' },
    { id: 'task-2', text: 'Write ad copy for Alberton opening', campaignName: 'Alberton Grand Opening', campaignId: 'camp-2', status: 'In Progress' },
    { id: 'task-3', text: 'Finalize budget allocation', campaignName: 'Summer Sale Kickoff', campaignId: 'camp-1', status: 'Done' },
  ],
  notes: [
    {
      id: 'note-1',
      title: 'Q3 Marketing Ideas',
      content: '- Focus on video content\n- Collaborate with local influencers',
      color: 'bg-blue-900/80',
      createdAt: new Date().toISOString(),
      imageUrl: null,
      sourceUrl: '',
      tags: ['strategy', 'video'],
    },
    {
      id: 'note-2',
      title: 'Competitor Ad Example',
      content: 'This ad from a competitor has a great call-to-action. The use of urgency is very effective.',
      color: 'bg-yellow-900/80',
      createdAt: new Date().toISOString(),
      imageUrl: 'https://placehold.co/600x400/1e1b4b/eab308?text=Ad+Screenshot',
      sourceUrl: 'https://www.facebook.com/ads/library',
      tags: ['competitor-x', 'strong-cta'],
    },
  ],
  budgets: [
    { id: 'budget-1', name: 'Summer Sale Kickoff', branch: 'National', amount: 25000, spent: 18500, status: 'Completed', startDate: '2024-08-01' },
    { id: 'budget-2', name: 'Alberton Grand Opening', branch: 'Alberton', amount: 5000, spent: 4500, status: 'Live', startDate: '2024-09-01' },
  ],
};

const AppContext = createContext();

export function AppProvider({ children }) {
  const [campaigns, setCampaigns] = useState(initialData.campaigns);
  const [tasks, setTasks]         = useState(initialData.tasks);
  const [notes, setNotes]         = useState(initialData.notes);
  const [budgets, setBudgets]     = useState(initialData.budgets);
  const [loading, setLoading]     = useState(false);

  // Save or update an entry in the chosen collection
  const saveData = (collectionName, data) => {
    const dataToSave = { ...data };
    const stateUpdater = {
      campaigns: setCampaigns,
      tasks:     setTasks,
      notes:     setNotes,
      budgets:   setBudgets,
    }[collectionName];

    if (!stateUpdater) return;
    stateUpdater(prevData => {
      if (dataToSave.id) {
        return prevData.map(item =>
          item.id === dataToSave.id ? dataToSave : item
        );
      } else {
        dataToSave.id = uuidv4();
        return [...prevData, dataToSave];
      }
    });
  };

  // Delete an entry by ID from the chosen collection
  const deleteData = (collectionName, id) => {
    const stateUpdater = {
      campaigns: setCampaigns,
      tasks:     setTasks,
      notes:     setNotes,
      budgets:   setBudgets,
    }[collectionName];

    if (!stateUpdater) return;
    stateUpdater(prevData => prevData.filter(item => item.id !== id));
  };

  // — New: Upload a file to Firebase Storage and return its download URL —
  const uploadFile = async (file, folder) => {
    setLoading(true);
    try {
      const timestamp = Date.now();
      const fileRef = ref(storage, `${folder}/${timestamp}_${file.name}`);
      await uploadBytes(fileRef, file);
      const url = await getDownloadURL(fileRef);
      return url;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    campaigns,
    tasks,
    notes,
    budgets,
    setCampaigns,
    setTasks,
    setNotes,
    setBudgets,
    loading,
    saveData,
    deleteData,
    uploadFile,        // ← now exposed
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
