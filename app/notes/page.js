// app/notes/page.js
import NoteClientView from './NoteClientView';
// Import the new admin database instance for server-side use
import { adminDb } from '../lib/firebase-admin';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

// Server-side function to get initial notes
async function getNotes() {
    try {
        // Use 'adminDb' here instead of the client-side 'db'
        const notesQuery = query(collection(adminDb, 'notes'), orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(notesQuery);
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