// app/context/AppContext.js
"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
// ✅ Import from your new central firebase file
import { db, storage } from './firebase'; 
import { collection, onSnapshot, doc, setDoc, deleteDoc, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [campaigns, setCampaigns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This logic remains the same
    const collectionsToFetch = {
      campaigns: setCampaigns,
      tasks: setTasks,
      notes: setNotes,
      budgets: setBudgets,
    };
    
    let loadedCount = 0;
    const totalCollections = Object.keys(collectionsToFetch).length;

    const unsubs = Object.entries(collectionsToFetch).map(([name, setter]) => 
      onSnapshot(collection(db, name), (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setter(data);
        
        loadedCount++;
        if (loadedCount === totalCollections) {
            setLoading(false);
        }
      }, (error) => {
        console.error("Error fetching collection: ", name, error);
        loadedCount++;
        if (loadedCount === totalCollections) {
            setLoading(false);
        }
      })
    );

    return () => unsubs.forEach(unsub => unsub());
  }, []);

  // Data management functions remain the same
  const saveData = async (collectionName, data) => {
    const dataToSave = { ...data };
    Object.keys(dataToSave).forEach(key => {
        if (dataToSave[key] === undefined) {
            delete dataToSave[key];
        }
    });

    if (data.id) {
      const docRef = doc(db, collectionName, data.id);
      await setDoc(docRef, dataToSave, { merge: true });
    } else {
      await addDoc(collection(db, collectionName), dataToSave);
    }
  };

  const deleteData = async (collectionName, id) => {
    await deleteDoc(doc(db, collectionName, id));
  };

  const uploadFile = async (file, path) => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
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
  return useContext(AppContext);
}