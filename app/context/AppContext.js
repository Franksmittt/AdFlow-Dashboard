"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, addDoc, writeBatch } from "firebase/firestore";

// This object now securely reads from your .env.local file
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const AppContext = createContext();

export function AppProvider({ children }) {
  const [campaigns, setCampaigns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  // This effect will listen for REAL-TIME updates from Firestore
  useEffect(() => {
    setLoading(true);
    
    const collections = {
      campaigns: setCampaigns,
      tasks: setTasks,
      notes: setNotes,
      budgets: setBudgets,
    };

    const unsubs = Object.entries(collections).map(([name, setter]) => 
      onSnapshot(collection(db, name), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setter(data);
      })
    );
    
    setLoading(false);

    // Cleanup function to stop listening when the component unmounts
    return () => unsubs.forEach(unsub => unsub());
  }, []);

  // --- Generic Data Management Functions ---
  const saveData = async (collectionName, data) => {
    if (data.id) {
      const docRef = doc(db, collectionName, data.id);
      await setDoc(docRef, data, { merge: true });
    } else {
      await addDoc(collection(db, collectionName), data);
    }
  };

  const deleteData = async (collectionName, id) => {
    await deleteDoc(doc(db, collectionName, id));
  };

  const value = {
    campaigns,
    tasks,
    notes,
    budgets,
    loading,
    saveData,
    deleteData,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}
