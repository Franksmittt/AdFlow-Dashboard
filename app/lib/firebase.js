// app/lib/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// --- This is YOUR Firebase configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyDSdnhsw77YysH9WxcMbWoTROwpANXZ3YWG",
  authDomain: "adflowdashboard.firebaseapp.com",
  projectId: "adflowdashboard",
  storageBucket: "adflowdashboard.appspot.com",
  messagingSenderId: "267813659682",
  appId: "1:267813659682:web:0147db8058022450841567b"
};
// ---------------------------------------------

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { db, storage, auth };
