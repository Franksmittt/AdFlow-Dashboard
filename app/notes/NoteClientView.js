// app/notes/NoteClientView.js
"use client";
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
import ConfirmationModal from '../components/ui/ConfirmationModal';
import NoteCard from '../components/notes/NoteCard';
import NoteEditorModal from '../components/notes/NoteEditorModal';
import { Plus } from '../components/icons';

export default function NoteClientView() {
    const { notes, saveData, deleteData, loading } = useAppContext();
    const [isEditorOpen, setEditorOpen] = useState(false);
    const [noteToEdit, setNoteToEdit] = useState(null);
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState(null);

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

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-950">
                <Sidebar />
                <main id="main-content" className="flex-1 p-6 md:p-8 lg:p-10">
                    <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
                        <div>
                            <div className="h-9 bg-gray-700 rounded w-48 mb-2 animate-pulse"></div>
                            <div className="h-5 bg-gray-700 rounded w-72 animate-pulse"></div>
                        </div>
                    </header>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <div className="h-48 bg-gray-800/50 rounded-xl animate-pulse"></div>
                        <div className="h-48 bg-gray-800/50 rounded-xl animate-pulse"></div>
                        <div className="h-48 bg-gray-800/50 rounded-xl animate-pulse"></div>
                        <div className="h-48 bg-gray-800/50 rounded-xl animate-pulse"></div>
                    </div>
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
                            <h2 className="text-3xl font-bold text-white">Notes Hub</h2>
                            <p className="text-gray-400 mt-1">Your space for brainstorming and strategic planning.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleOpenCreateModal} className="px-5 py-2.5 text-sm font-semibold text-gray-950 bg-yellow-400 rounded-lg shadow-md hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2 whitespace-nowrap" aria-label="Create New Note">
                                <Plus className="w-5 h-5" /> Create Note
                            </button>
                        </div>
                    </header>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 overflow-y-auto pb-4">
                        {notes.map(note => (
                            <NoteCard key={note.id} note={note} onEdit={handleOpenEditModal} onDelete={handleDelete} />
                        ))}
                    </div>
                </main>
                <NoteEditorModal isOpen={isEditorOpen} onClose={() => setEditorOpen(false)} onSave={handleSaveNote} noteToEdit={noteToEdit} />
                <ConfirmationModal
                    isOpen={isConfirmOpen}
                    onClose={() => setConfirmOpen(false)}
                    onConfirm={confirmDelete}
                    message="Are you sure you want to delete this note?"
                />
            </div>
        </div>
    );
}