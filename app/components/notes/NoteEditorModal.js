// app/components/notes/NoteEditorModal.js
"use client";
import React, { useEffect } from 'react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const NOTE_COLORS = ['bg-gray-800', 'bg-red-900/80', 'bg-yellow-900/80', 'bg-green-900/80', 'bg-blue-900/80', 'bg-indigo-900/80', 'bg-purple-900/80', 'bg-pink-900/80'];

const noteSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required'),
    color: z.string()
});

export default function NoteEditorModal({ isOpen, onClose, onSave, noteToEdit }) {
    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
        resolver: zodResolver(noteSchema),
    });

    const selectedColor = watch('color', noteToEdit?.color || NOTE_COLORS[0]);

    useEffect(() => {
        // This effect runs when the modal opens to populate the form
        // with the note's data if we are editing, or resets it if creating.
        const defaultValues = {
            title: noteToEdit?.title || '',
            content: noteToEdit?.content || '',
            color: noteToEdit?.color || NOTE_COLORS[0]
        };
        reset(defaultValues);
    }, [isOpen, noteToEdit, reset]);

    useEffect(() => {
        // This effect shows toast notifications for form errors.
        if (errors.title) toast.error(errors.title.message);
        if (errors.content) toast.error(errors.content.message);
    }, [errors]);

    if (!isOpen) {
        return null;
    }

    const onSubmit = (data) => {
        const noteToSave = {
            ...noteToEdit,
            ...data,
            id: noteToEdit?.id,
            createdAt: noteToEdit?.createdAt || new Date().toISOString()
        };
        onSave(noteToSave);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-800 w-full max-w-lg rounded-xl shadow-2xl m-4">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex items-center justify-between p-6 border-b border-gray-800">
                        <h3 className="text-xl font-semibold text-white">{noteToEdit ? 'Edit Note' : 'Create New Note'}</h3>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none" aria-label="Close modal">&times;</button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="noteTitle" className="block text-sm font-medium text-gray-300 mb-1">Note Title</label>
                            <input {...register("title")} id="noteTitle" placeholder="e.g., Competitor Analysis" className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                        </div>
                        <div>
                            <label htmlFor="noteContent" className="block text-sm font-medium text-gray-300 mb-1">Content</label>
                            <textarea {...register("content")} id="noteContent" rows="6" placeholder="Jot down your ideas..." className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                            <div className="flex gap-3">
                                {NOTE_COLORS.map(colorClass => (
                                    <button
                                        type="button"
                                        key={colorClass}
                                        onClick={() => setValue('color', colorClass, { shouldValidate: true })}
                                        className={`w-8 h-8 rounded-full ${colorClass} transition-transform duration-150 ${selectedColor === colorClass ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-white' : 'hover:scale-110'}`}
                                        aria-label={`Select color ${colorClass.split('-')[1]}`}
                                    ></button>
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