// app/components/notes/NoteEditorModal.js
"use client";
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import { useAppContext } from '../../context/AppContext'; // Import context

const NOTE_COLORS = ['bg-gray-800', 'bg-red-900/80', 'bg-yellow-900/80', 'bg-green-900/80', 'bg-blue-900/80', 'bg-indigo-900/80', 'bg-purple-900/80', 'bg-pink-900/80'];

const noteSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    content: z.string().min(1, 'Content is required'),
    color: z.string(),
    imageUrl: z.string().nullable(),
    sourceUrl: z.string().url().or(z.literal('')),
    tags: z.array(z.string()),
});

export default function NoteEditorModal({ isOpen, onClose, onSave, noteToEdit }) {
    const { uploadFile } = useAppContext(); // Get uploadFile function
    const [isUploading, setIsUploading] = useState(false);
    
    const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm({
        resolver: zodResolver(noteSchema),
        defaultValues: {
            title: '', content: '', color: NOTE_COLORS[0],
            imageUrl: null, sourceUrl: '', tags: [],
        }
    });

    const [tagInput, setTagInput] = useState('');
    const selectedColor = watch('color');
    const imageUrl = watch('imageUrl');
    const tags = watch('tags');

    useEffect(() => {
        if (isOpen) {
            reset({
                title: noteToEdit?.title || '',
                content: noteToEdit?.content || '',
                color: noteToEdit?.color || NOTE_COLORS[0],
                imageUrl: noteToEdit?.imageUrl || null,
                sourceUrl: noteToEdit?.sourceUrl || '',
                tags: noteToEdit?.tags || [],
            });
        }
    }, [isOpen, noteToEdit, reset]);

    useEffect(() => {
        Object.values(errors).forEach(error => {
            if (error.message) toast.error(error.message);
        });
    }, [errors]);

    if (!isOpen) return null;

    const onSubmit = (data) => {
        const noteToSave = {
            ...noteToEdit, ...data, id: noteToEdit?.id,
        };
        onSave(noteToSave);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(true);
        const toastId = toast.loading("Uploading image...");

        try {
            // Use uploadFile from context
            const downloadURL = await uploadFile(file, 'note-images');
            setValue('imageUrl', downloadURL, { shouldValidate: true });
            toast.success("Image uploaded!", { id: toastId });
        } catch (error) {
            console.error("File upload error:", error);
            toast.error("Upload failed. Please try again.", { id: toastId });
        } finally {
            setIsUploading(false);
        }
    };

    const handleTagKeyDown = (e) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = tagInput.trim();
            if (newTag && !tags.includes(newTag)) {
                setValue('tags', [...tags, newTag], { shouldValidate: true });
            }
            setTagInput('');
        }
    };

    const removeTag = (tagToRemove) => {
        setValue('tags', tags.filter(tag => tag !== tagToRemove), { shouldValidate: true });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-800 w-full max-w-2xl rounded-xl shadow-2xl m-4">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="flex items-center justify-between p-6 border-b border-gray-800">
                        <h3 className="text-xl font-semibold text-white">{noteToEdit ? 'Edit Swipe File Entry' : 'Create Swipe File Entry'}</h3>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none" aria-label="Close modal">&times;</button>
                    </div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label htmlFor="noteImage" className="block text-sm font-medium text-gray-300 mb-1">Ad Creative (Image/Video Screenshot)</label>
                            <input type="file" id="noteImage" accept="image/*,video/*" onChange={handleImageUpload} disabled={isUploading} className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-400 file:text-gray-950 hover:file:bg-yellow-300 disabled:file:bg-gray-500" />
                            {isUploading && <p className="text-xs text-yellow-400 mt-1">Uploading, please wait...</p>}
                            {imageUrl && (
                                <div className="mt-4 relative w-full h-48 bg-gray-800 rounded-lg">
                                    <Image src={imageUrl} alt="Creative preview" layout="fill" className="object-contain rounded-lg" />
                                </div>
                            )}
                        </div>
                        <div>
                            <label htmlFor="noteTitle" className="block text-sm font-medium text-gray-300 mb-1">Title / Headline</label>
                            <input {...register("title")} id="noteTitle" placeholder="e.g., Awesome Competitor Video Ad" className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                        </div>
                        <div>
                            <label htmlFor="sourceUrl" className="block text-sm font-medium text-gray-300 mb-1">Source URL (Optional)</label>
                            <input {...register("sourceUrl")} id="sourceUrl" placeholder="e.g., https://facebook.com/ads/library/..." className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                        </div>
                        <div>
                            <label htmlFor="noteContent" className="block text-sm font-medium text-gray-300 mb-1">Analysis / Notes</label>
                            <textarea {...register("content")} id="noteContent" rows="4" placeholder="Jot down your analysis..." className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"></textarea>
                        </div>
                        <div>
                            <label htmlFor="tags" className="block text-sm font-medium text-gray-300 mb-1">Tags</label>
                            <div className="flex flex-wrap items-center gap-2 p-2 bg-gray-800 border border-gray-700 rounded-lg">
                                {tags.map(tag => (
                                    <div key={tag} className="flex items-center gap-1 bg-blue-900/80 text-blue-300 text-xs font-medium px-2 py-1 rounded-full">
                                        {tag}
                                        <button type="button" onClick={() => removeTag(tag)} className="text-blue-200 hover:text-white">&times;</button>
                                    </div>
                                ))}
                                <input id="tags" value={tagInput} onChange={e => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown} placeholder="Add a tag and press Enter" className="flex-1 bg-transparent text-white outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
                            <div className="flex gap-3">
                                {NOTE_COLORS.map(colorClass => (
                                    <button type="button" key={colorClass} onClick={() => setValue('color', colorClass)} className={`w-8 h-8 rounded-full ${colorClass} transition-transform duration-150 ${selectedColor === colorClass ? 'ring-2 ring-offset-2 ring-offset-gray-900 ring-white' : 'hover:scale-110'}`} aria-label={`Select color ${colorClass.split('-')[1]}`}></button>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center justify-end p-6 border-t border-gray-800 space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-semibold text-gray-950 bg-yellow-400 rounded-lg hover:bg-yellow-300 transition-colors">Save Entry</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
