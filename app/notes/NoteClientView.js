// app/notes/NoteClientView.js
"use client";
import React, { useState, useMemo } from 'react';
import Sidebar from '../components/Sidebar';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import NoteCard from '../components/notes/NoteCard';
import NoteEditorModal from '../components/notes/NoteEditorModal';
import { Plus, Search } from '../components/icons';

export default function NoteClientView() {
    const { notes, saveData, deleteData, loading } = useAppContext();
    const [isEditorOpen, setEditorOpen] = useState(false);
    const [noteToEdit, setNoteToEdit] = useState(null);
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState(null);

    // --- NEW: State for filtering and searching ---
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);

    const handleSaveNote = async (savedNote) => {
        try {
            await toast.promise(saveData('notes', savedNote), {
                loading: 'Saving note...',
                success: 'Note saved successfully!',
                error: 'Failed to save note.',
            });
            setEditorOpen(false);
        } catch (error) {
            console.error("Error saving note: ", error);
        }
    };

    const handleOpenCreateModal = () => {
        setNoteToEdit(null);
        setEditorOpen(true);
    };

    const handleOpenEditModal = (note) => {
        setNoteToEdit(note);
        setEditorOpen(true);
    };

    const handleDelete = (id) => {
        setNoteToDelete(id);
        setConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!noteToDelete) return;
        try {
            await deleteData('notes', noteToDelete);
            toast.success('Note deleted.');
        } catch (error) {
            toast.error('Failed to delete note.');
        } finally {
            setConfirmOpen(false);
            setNoteToDelete(null);
        }
    };

    // --- NEW: Memoized filtering logic ---
    const allTags = useMemo(() => {
        const tagsSet = new Set(notes.flatMap(note => note.tags || []));
        return Array.from(tagsSet);
    }, [notes]);

    const filteredNotes = useMemo(() => {
        return notes
            .filter(note => {
                // Search query filter
                const query = searchQuery.toLowerCase();
                const inTitle = note.title.toLowerCase().includes(query);
                const inContent = note.content.toLowerCase().includes(query);
                const searchMatch = inTitle || inContent;

                // Tags filter
                const tagsMatch = selectedTags.length === 0 || selectedTags.every(tag => (note.tags || []).includes(tag));

                return searchMatch && tagsMatch;
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by most recent
    }, [notes, searchQuery, selectedTags]);

    const handleTagClick = (tag) => {
        setSelectedTags(prev => 
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    if (loading) {
        // Skeleton loading UI remains the same
        return (
            <div className="flex h-screen bg-gray-950">
                <Sidebar />
                <main id="main-content" className="flex-1 p-6 md:p-8 lg:p-10">
                    {/* ... skeleton content ... */}
                </main>
            </div>
        );
    }

    return (
        <div className="font-sans antialiased text-gray-200">
            <div className="flex h-screen bg-gray-950">
                <Sidebar />
                <main id="main-content" className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col">
                    <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 flex-shrink-0">
                        <div>
                            <h2 className="text-3xl font-bold text-white">Creative Swipe File</h2>
                            <p className="text-gray-400 mt-1">Your library of ad inspiration and ideas.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleOpenCreateModal} className="px-5 py-2.5 text-sm font-semibold text-gray-950 bg-yellow-400 rounded-lg shadow-md hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2 whitespace-nowrap" aria-label="Create New Entry">
                                <Plus className="w-5 h-5" /> Add Entry
                            </button>
                        </div>
                    </header>

                    {/* --- NEW: Filter and Search UI --- */}
                    <div className="flex flex-col md:flex-row gap-4 mb-6 flex-shrink-0">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search by title or content..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700/50 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
                            />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2">
                             <span className="text-sm text-gray-400 flex-shrink-0">Filter by Tag:</span>
                             {allTags.map(tag => (
                                <button 
                                    key={tag}
                                    onClick={() => handleTagClick(tag)}
                                    className={`px-3 py-1 text-xs font-medium rounded-full transition-colors flex-shrink-0 ${selectedTags.includes(tag) ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                                >
                                    #{tag}
                                </button>
                             ))}
                        </div>
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pb-4">
                        {filteredNotes.length > 0 ? (
                            filteredNotes.map(note => (
                                <NoteCard key={note.id} note={note} onEdit={handleOpenEditModal} onDelete={handleDelete} />
                            ))
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center text-center text-gray-500 h-full">
                                <p className="text-lg font-semibold">No Matching Notes Found</p>
                                <p>Try adjusting your search or filters.</p>
                            </div>
                        )}
                    </div>
                </main>
                <NoteEditorModal isOpen={isEditorOpen} onClose={() => setEditorOpen(false)} onSave={handleSaveNote} noteToEdit={noteToEdit} />
                <ConfirmationModal
                    isOpen={isConfirmOpen}
                    onClose={() => setConfirmOpen(false)}
                    onConfirm={confirmDelete}
                    message="Are you sure you want to delete this entry?"
                />
            </div>
        </div>
    );
}
