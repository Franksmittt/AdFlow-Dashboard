"use client";

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import { useAppContext } from '../context/AppContext';

// --- ICONS (No changes) --- //
const Plus = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>;
const MoreVertical = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>;
const Edit = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const Trash2 = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;

// --- CONFIG (No changes) --- //
const NOTE_COLORS = ['bg-gray-800', 'bg-red-900/80', 'bg-yellow-900/80', 'bg-green-900/80', 'bg-blue-900/80', 'bg-indigo-900/80', 'bg-purple-900/80', 'bg-pink-900/80'];

// --- REUSABLE COMPONENTS (No changes) --- //
const NoteEditorModal = ({ isOpen, onClose, onSave, noteToEdit }) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [color, setColor] = useState(NOTE_COLORS[0]);

    useEffect(() => {
        if (noteToEdit) {
            setTitle(noteToEdit.title || '');
            setContent(noteToEdit.content || '');
            setColor(noteToEdit.color || NOTE_COLORS[0]);
        } else {
            setTitle('');
            setContent('');
            setColor(NOTE_COLORS[0]);
        }
    }, [noteToEdit, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const savedNote = {
            ...noteToEdit,
            id: noteToEdit ? noteToEdit.id : undefined,
            title,
            content,
            color,
        };
        onSave(savedNote);
        // We will now close the modal from the handleSaveNote function on success
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-800 w-full max-w-lg rounded-xl shadow-2xl m-4" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center justify-between p-6 border-b border-gray-800">
                        <h3 className="text-xl font-semibold text-white">{noteToEdit ? 'Edit Note' : 'Create New Note'}</h3>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="noteTitle" className="block text-sm font-medium text-gray-300 mb-1">Note Title</label>
                            <input type="text" name="noteTitle" id="noteTitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Competitor Analysis" required className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                        </div>
                        <div>
                            <label htmlFor="noteContent" className="block text-sm font-medium text-gray-300 mb-1">Content</label>
                            <textarea name="noteContent" id="noteContent" value={content} onChange={(e) => setContent(e.target.value)} rows="6" placeholder="Jot down your ideas..." required className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                            <div className="flex gap-3">
                                {NOTE_COLORS.map(c => (
                                    <button type="button" key={c} onClick={() => setColor(c)} className={`w-8 h-8 rounded-full ${c} transition-transform duration-150 ${color === c ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-white' : 'hover:scale-110'}`} aria-label={`Select color ${c}`}></button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-end p-6 border-t border-gray-800 space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-semibold text-gray-950 bg-yellow-400 rounded-lg hover:bg-yellow-300 transition-colors">Save Note</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const NoteCard = ({ note, onEdit, onDelete }) => {
    const [isMenuOpen, setMenuOpen] = useState(false);
    return (
        <div className={`rounded-xl shadow-lg flex flex-col ${note.color} border border-gray-700/50`}>
            <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-white">{note.title}</h3>
                    <div className="relative">
                        <button onClick={() => setMenuOpen(!isMenuOpen)} onBlur={() => setTimeout(() => setMenuOpen(false), 100)} className="text-white/60 hover:text-white">
                            <MoreVertical className="w-5 h-5" />
                        </button>
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-32 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10">
                                <button onClick={() => { onEdit(note); setMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"><Edit className="w-4 h-4" /> Edit</button>
                                <button onClick={() => { onDelete(note.id); setMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-700"><Trash2 className="w-4 h-4" /> Delete</button>
                            </div>
                        )}
                    </div>
                </div>
                <p className="text-white/80 text-sm whitespace-pre-wrap flex-1">{note.content}</p>
            </div>
        </div>
    );
};

// --- MAIN PAGE COMPONENT --- //
export default function NotesPage() {
    const { notes, saveData, deleteData, loading } = useAppContext();
    const [isEditorOpen, setEditorOpen] = useState(false);
    const [noteToEdit, setNoteToEdit] = useState(null);

    // UPDATED: handleSaveNote now has error handling
    const handleSaveNote = async (savedNote) => {
        try {
            await saveData('notes', savedNote);
            setEditorOpen(false); // Only close modal on success
        } catch (error) {
            console.error("Error saving note: ", error);
            alert("Failed to save note. Please check the console for details.");
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
    
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this note?")) {
            await deleteData('notes', id);
        }
    };

    if (loading) {
        return (
            <div className="flex h-screen bg-gray-950 text-white items-center justify-center">
                Loading Notes...
            </div>
        )
    }

    return (
        <div className="font-sans antialiased text-gray-200">
            <div className="flex h-screen bg-gray-950">
                <Sidebar />
                <main className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col">
                    <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 flex-shrink-0">
                        <div>
                            <h2 className="text-3xl font-bold text-white">Notes Hub</h2>
                            <p className="text-gray-400 mt-1">Your space for brainstorming and strategic planning.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleOpenCreateModal} className="px-5 py-2.5 text-sm font-semibold text-gray-950 bg-yellow-400 rounded-lg shadow-md hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2 whitespace-nowrap">
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
            </div>
        </div>
    );
}
