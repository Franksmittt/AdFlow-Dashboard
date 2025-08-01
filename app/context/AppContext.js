// app/context/AppContext.js
"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, onSnapshot, doc, setDoc, deleteDoc, Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

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
  const isDev = process.env.NODE_ENV === 'development';
  const [campaigns, setCampaigns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In development, use hardcoded data to avoid
    // hitting Firestore quotas and for faster local development.
    if (isDev) {
      setCampaigns(initialData.campaigns);
      setTasks(initialData.tasks);
      setNotes(initialData.notes);
      setBudgets(initialData.budgets);
      setLoading(false);
      return;
    }

    // In production, fetch data from Firestore and subscribe to real-time updates
    const unsubscribes = [
      onSnapshot(collection(db, 'campaigns'), (snapshot) => {
        setCampaigns(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      }),
      onSnapshot(collection(db, 'tasks'), (snapshot) => {
        setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      }),
      onSnapshot(collection(db, 'notes'), (snapshot) => {
        setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      }),
      onSnapshot(collection(db, 'budgets'), (snapshot) => {
        setBudgets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      }),
    ];

    return () => unsubscribes.forEach(unsub => unsub());
  }, [isDev]);


  // Save or update an entry in Firestore
  const saveData = async (collectionName, data) => {
    const dataToSave = { ...data };
    let docRef;

    if (dataToSave.id) {
      docRef = doc(db, collectionName, dataToSave.id);
    } else {
      docRef = doc(collection(db, collectionName));
      dataToSave.id = docRef.id;
    }

    await setDoc(docRef, dataToSave);
  };

  // Delete an entry by ID from Firestore
  const deleteData = async (collectionName, id) => {
    await deleteDoc(doc(db, collectionName, id));
  };


  // Upload a file to Firebase Storage and return its download URL
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