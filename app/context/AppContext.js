// app/context/AppContext.js
"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';
// Firebase imports are now commented out.
// import { db, storage } from '../lib/firebase';
// import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
// import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';

const LOCAL_STORAGE_KEY = 'adflow-hub-data';

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
    { id: 'task-1', text: 'Design visuals for Summer Sale', campaign: 'Summer Sale Kickoff', campaignId: 'camp-1', status: 'To Do' },
    { id: 'task-2', text: 'Write ad copy for Alberton opening', campaign: 'Alberton Grand Opening', campaignId: 'camp-2', status: 'In Progress' },
    { id: 'task-3', text: 'Finalize budget allocation', campaign: 'Summer Sale Kickoff', campaignId: 'camp-1', status: 'Done' },
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
    { id: 'budget-1', name: 'Summer Sale Kickoff', branch: 'National', totalBudget: 25000, spent: 18500, status: 'Completed', startDate: '2024-08-01' },
    { id: 'budget-2', name: 'Alberton Grand Opening', branch: 'Alberton', totalBudget: 5000, spent: 4500, status: 'Live', startDate: '2024-09-01' },
  ],
};

const AppContext = createContext();

export function AppProvider({ children }) {
  const [campaigns, setCampaigns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load data from local storage on initial render
  useEffect(() => {
    try {
      const storedData = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedData) {
        const data = JSON.parse(storedData);
        setCampaigns(data.campaigns);
        setTasks(data.tasks);
        setNotes(data.notes);
        setBudgets(data.budgets);
      } else {
        // Use initial data if no local storage data exists
        setCampaigns(initialData.campaigns);
        setTasks(initialData.tasks);
        setNotes(initialData.notes);
        setBudgets(initialData.budgets);
      }
    } catch (error) {
      console.error("Failed to load state from local storage", error);
      // Fallback to initial data if there's an error
      setCampaigns(initialData.campaigns);
      setTasks(initialData.tasks);
      setNotes(initialData.notes);
      setBudgets(initialData.budgets);
    } finally {
      setLoading(false);
    }
  }, []);

  // Sync data to local storage on every state change
  useEffect(() => {
    const allData = { campaigns, tasks, notes, budgets };
    if (!loading) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(allData));
    }
  }, [campaigns, tasks, notes, budgets, loading]);


  const saveData = async (collectionName, data) => {
    const dataToSave = { ...data };
    
    // Fallback to local storage for saving
    let docToSave = dataToSave;
    if (!docToSave.id) {
      docToSave = { ...dataToSave, id: uuidv4() };
    }

    let updatedCollection;
    let setter;

    if (collectionName === 'campaigns') {
      updatedCollection = [...campaigns];
      setter = setCampaigns;
    } else if (collectionName === 'tasks') {
      updatedCollection = [...tasks];
      setter = setTasks;
    } else if (collectionName === 'notes') {
      updatedCollection = [...notes];
      setter = setNotes;
    } else if (collectionName === 'budgets') {
      updatedCollection = [...budgets];
      setter = setBudgets;
    }

    const index = updatedCollection.findIndex(item => item.id === docToSave.id);
    if (index > -1) {
      updatedCollection[index] = docToSave;
    } else {
      updatedCollection.push(docToSave);
    }

    setter(updatedCollection);
    return docToSave;
  };

  const deleteData = async (collectionName, id) => {
    let updatedCollection;
    let setter;

    if (collectionName === 'campaigns') {
      updatedCollection = campaigns.filter(item => item.id !== id);
      setter = setCampaigns;
    } else if (collectionName === 'tasks') {
      updatedCollection = tasks.filter(item => item.id !== id);
      setter = setTasks;
    } else if (collectionName === 'notes') {
      updatedCollection = notes.filter(item => item.id !== id);
      setter = setNotes;
    } else if (collectionName === 'budgets') {
      updatedCollection = budgets.filter(item => item.id !== id);
      setter = setBudgets;
    }

    setter(updatedCollection);
  };

  const uploadFile = async (file, folder) => {
    // With local storage, we can't upload files. Just return a placeholder.
    toast.error("File upload is not supported in local mode. Please use the live version for this feature.");
    return `https://via.placeholder.com/300x200?text=${file.name}`;
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
    uploadFile,
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