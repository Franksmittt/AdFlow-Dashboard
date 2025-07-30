// app/notes/page.js
import NoteClientView from './NoteClientView';
import { getFirestore, collection, getDocs, query } from 'firebase/firestore';
import { db } from '../context/firebase';

// Server-side function to get initial notes
async function getNotes() {
    try {
        // You might want to add ordering to your notes
        const snapshot = await getDocs(query(collection(db, 'notes')));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error("Failed to fetch notes on server:", error);
        return [];
    }
}

// Main Server Component for the page
export default async function NotesPage() {
    // Fetch initial data on the server
    const initialNotes = await getNotes();

    // Pass data to the Client Component
    return <NoteClientView initialNotes={initialNotes} />;
}