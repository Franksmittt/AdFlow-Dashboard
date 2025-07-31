// app/context/AppContext.js
"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, storage } from './firebase';
import { collection, onSnapshot, doc, setDoc, deleteDoc, addDoc, query, orderBy } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import toast from 'react-hot-toast';

const AppContext = createContext();
export function AppProvider({ children }) {
  const [campaigns, setCampaigns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const collectionsToFetch = {
      campaigns: { setter: setCampaigns, q: query(collection(db, 'campaigns'), orderBy('startDate', 'desc')) },
      tasks: { setter: setTasks, q: query(collection(db, 'tasks')) },
      notes: { setter: setNotes, q: query(collection(db, 'notes'), orderBy('createdAt', 'desc')) },
      budgets: { setter: setBudgets, q: query(collection(db, 'budgets'), orderBy('startDate', 'desc')) },
    };

    const totalCollections = Object.keys(collectionsToFetch).length;
    let loadedCount = 0;

    // Set a timeout to prevent the app from getting stuck in a loading state
    const loadingTimeout = setTimeout(() => {
        if (loading) {
            console.warn("Data loading timed out. Some collections may not have loaded.");
            toast.error("Some data failed to load. The app may be running with partial data.");
            setLoading(false);
        }
    }, 10000); // 10-second timeout

    const unsubs = Object.entries(collectionsToFetch).map(([name, { setter, q }]) =>
      onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setter(data);

        // Check if this is the first time this collection has loaded
        if (loading) {
            loadedCount++;
            if (loadedCount === totalCollections) {
                clearTimeout(loadingTimeout); // Clear timeout if all data loads successfully
                setLoading(false);
            }
        }
      }, (error) => {
        console.error(`Error fetching collection '${name}':`, error);
        toast.error(`Failed to load ${name}. Please try again.`);
        if (loading) {
            loadedCount++;
            if (loadedCount === totalCollections) {
                clearTimeout(loadingTimeout);
                setLoading(false);
            }
        }
      })
    );
    // Cleanup function to unsubscribe from listeners and clear the timeout
    return () => {
        unsubs.forEach(unsub => unsub());
        clearTimeout(loadingTimeout);
    };
  }, []); // The empty dependency array ensures this effect runs only once on mount

  const saveData = async (collectionName, data) => {
    const dataToSave = { ...data };
    // Remove undefined fields before saving to Firestore
    Object.keys(dataToSave).forEach(key => {
        if (dataToSave[key] === undefined) {
            delete dataToSave[key];
        }
    });
    try {
        if (data.id) {
            const docRef = doc(db, collectionName, data.id);
            // Use set with merge:true to update or create, preventing accidental data loss
            await setDoc(docRef, dataToSave, { merge: true });
        } else {
            await addDoc(collection(db, collectionName), dataToSave);
        }
    } catch (error) {
        console.error(`Error saving data to ${collectionName}:`, error);
        throw new Error(`Failed to save data: ${error.message}`);
    }
  };
  const deleteData = async (collectionName, id) => {
    try {
        await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
        console.error(`Error deleting data from ${collectionName}:`, error);
        throw new Error(`Failed to delete data: ${error.message}`);
    }
  };
  const uploadFile = async (file, path) => {
    const storageRef = ref(storage, path);
    try {
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        return downloadURL;
    } catch (error) {
        console.error("Error uploading file:", error);
        throw new Error("Failed to upload file.");
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