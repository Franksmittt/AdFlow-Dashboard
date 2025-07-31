// app/notes/page.js
"use client"; // This page now only renders a client component.

import NoteClientView from './NoteClientView';

// This is now a simple component that renders the client view.
// No data fetching is needed here anymore.
export default function NotesPage() {
    // The NoteClientView will get all its data from the AppContext.
    // We pass an empty array for the initial prop as it is no longer used.
    return <NoteClientView initialNotes={[]} />;
}
