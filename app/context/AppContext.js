"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, doc, setDoc, deleteDoc, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Import storage functions

// Your web app's Firebase configuration
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
const storage = getStorage(app); // Initialize Storage

const AppContext = createContext();

export function AppProvider({ children }) {
  const [campaigns, setCampaigns] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [notes, setNotes] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  // --- Data Management Functions ---
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

  // NEW: Function to upload files to Firebase Storage
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
    loading,
    saveData,
    deleteData,
    uploadFile, // Expose the new function
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
