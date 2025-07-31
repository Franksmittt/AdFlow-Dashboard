// app/components/notes/NoteCard.js
"use client";
import React, { useState } from 'react';
import { MoreVertical, Edit, Trash2, Link as LinkIcon } from '../icons';
import Image from 'next/image';

export default function NoteCard({ note, onEdit, onDelete }) {
    const [isMenuOpen, setMenuOpen] = useState(false);

    const handleMenuAction = (action) => {
        action();
        setMenuOpen(false);
    };

    return (
        <div className={`rounded-xl shadow-lg flex flex-col ${note.color} border border-gray-700/50`}>
            {/* Display Image if it exists */}
            {note.imageUrl && (
                <div className="relative w-full h-40 bg-gray-900 rounded-t-xl">
                    <Image
                        src={note.imageUrl}
                        alt={`Visual for ${note.title}`}
                        layout="fill"
                        className="object-cover rounded-t-xl"
                        onError={(e) => { e.target.style.display = 'none'; }} // Hide if image fails to load
                    />
                </div>
            )}
            
            <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-white break-words pr-2">{note.title}</h3>
                    <div className="relative flex-shrink-0">
                        <button
                            onClick={() => setMenuOpen(!isMenuOpen)}
                            onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
                            className="text-white/60 hover:text-white p-1 rounded-full"
                            aria-expanded={isMenuOpen}
                            aria-label="Note options"
                        >
                            <MoreVertical className="w-5 h-5" />
                        </button>
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-32 bg-gray-800 border border-gray-700 rounded-md shadow-lg z-10">
                                <button onClick={() => handleMenuAction(() => onEdit(note))} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700" aria-label={`Edit note: ${note.title}`}>
                                    <Edit className="w-4 h-4" /> Edit
                                </button>
                                <button onClick={() => handleMenuAction(() => onDelete(note.id))} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-700" aria-label={`Delete note: ${note.title}`}>
                                    <Trash2 className="w-4 h-4" /> Delete
                                </button>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Display Content */}
                <p className="text-white/80 text-sm whitespace-pre-wrap flex-1 break-words mb-4">{note.content}</p>

                {/* Display Tags and Source URL */}
                <div className="mt-auto pt-4 border-t border-white/10">
                    {note.tags && note.tags.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                            {note.tags.map(tag => (
                                <span key={tag} className="bg-gray-900/50 text-blue-300 text-xs font-medium px-2 py-1 rounded-full">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    )}
                    {note.sourceUrl && (
                        <a 
                            href={note.sourceUrl} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex items-center gap-2 text-xs text-yellow-400 hover:text-yellow-300 transition-colors"
                        >
                            <LinkIcon className="w-3 h-3" />
                            <span>View Original Source</span>
                        </a>
                    )}
                </div>
            </div>
        </div>
    );
};
