// app/notes/page.js
import NoteClientView from './NoteClientView'; // [cite: 421]
import { getFirestore, collection, getDocs, query, orderBy } from 'firebase/firestore'; // [cite: 422]
import { db } from '../context/firebase'; // [cite: 422]
// Corrected import path [cite: 423]

// Server-side function to get initial notes
async function getNotes() {
    try {
        // You might want to add ordering to your notes, which would require an index
        const notesQuery = query(collection(db, 'notes'), orderBy('createdAt', 'desc')); // Added orderBy
        const snapshot = await getDocs(notesQuery); // [cite: 424]
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })); // [cite: 424]
    } catch (error) { // [cite: 424]
        console.error("Failed to fetch notes on server:", error); // [cite: 425]
        return []; // [cite: 425]
    }
}

// Main Server Component for the page
export default async function NotesPage() {
    // Fetch initial data on the server
    const initialNotes = await getNotes(); // [cite: 426]
    // Pass data to the Client Component
    return <NoteClientView initialNotes={initialNotes} />; // [cite: 427]
}