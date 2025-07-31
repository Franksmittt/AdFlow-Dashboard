// app/components/campaigns/VisualManager.js
"use client";
import React, { useState, useEffect } from 'react';
// CHANGE: Corrected the import path to go up two levels
import { useAppContext } from '../../context/AppContext'; 
import toast from 'react-hot-toast';
import Image from 'next/image';

const AD_FORMATS = ["1:1", "4:5", "9:16"];
export default function VisualManager({ campaign, onSave }) {
    const { uploadFile } = useAppContext();
    const [visuals, setVisuals] = useState({ "1:1": null, "4:5": null, "9:16": null });
    const [newFiles, setNewFiles] = useState({});
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (campaign.visuals) {
            setVisuals(campaign.visuals);
        } else {
            setVisuals({ "1:1": null, "4:5": null, "9:16": null });
        }
        setNewFiles({});
    }, [campaign]);
    
    useEffect(() => {
        return () => {
            Object.values(visuals).forEach(url => {
                if (url && url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
            Object.values(newFiles).forEach(file => {
                if (file) {
                    URL.revokeObjectURL(URL.createObjectURL(file));
                }
            });
        };
    }, [visuals, newFiles]);

    const handleFileSelect = (format, e) => {
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
            if (!allowedTypes.includes(file.type)) {
                toast.error(`Unsupported file type for ${format}. Please use JPEG, PNG, GIF, or MP4/MOV.`);
                e.target.value = '';
                return;
            }
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                toast.error(`File size exceeds 10MB limit for ${format}.`);
                e.target.value = '';
                return;
            }
            setNewFiles(prev => ({ ...prev, [format]: file }));
            setVisuals(prev => ({ ...prev, [format]: URL.createObjectURL(file) }));
        }
    };

    const handleSave = async () => {
        setIsUploading(true);
        const updatedVisuals = { ...visuals };
        try {
            const uploadPromises = Object.entries(newFiles).map(async ([format, file]) => {
                if (file) {
                    const path = `campaigns/${campaign.id}/${format}-${file.name}`;
                    const downloadURL = await uploadFile(file, path);
                    updatedVisuals[format] = downloadURL;
                    toast.success(`Visual for ${format} uploaded!`);
                }
            });

            await Promise.all(uploadPromises);

            await toast.promise(
                onSave({ visuals: updatedVisuals }),
                {
                    loading: 'Updating campaign visuals...',
                    success: 'Campaign visuals updated successfully!',
                    error: 'Failed to update campaign visuals.',
                }
            );
            setNewFiles({});
        } catch (error) {
            console.error("Error saving visuals:", error);
            toast.error("Failed to save visuals.");
        } finally {
            setIsUploading(false);
        }
    };

    const hasChanges = Object.keys(newFiles).length > 0;
    return (
        <div className="bg-gray-800/50 border border-gray-800 p-6 rounded-xl mt-6">
            <h3 className="text-xl font-semibold text-white mb-4">🖼️ Visual Asset Manager</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {AD_FORMATS.map((format) => (
                    <div key={format}>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Format {format}</label>
                        <div className="w-full h-48 bg-gray-900/50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700 overflow-hidden relative">
                            {visuals[format] ? (
                                <Image
                                    src={visuals[format]}
                                    alt={`${format} visual preview`}
                                    fill
                                    className="object-contain"
                                />
                             ) : (
                                <span className="text-gray-500 text-sm">No Image</span>
                            )}
                         </div>
                        <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={(e) => handleFileSelect(format, e)}
                            className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-400 file:text-yellow-950 hover:file:bg-yellow-300 mt-3 cursor-pointer"
                        />
                    </div>
                ))}
            </div>

            {(hasChanges || isUploading) && (
                 <div className="flex justify-end mt-6">
                    <button
                        onClick={handleSave}
                        disabled={isUploading}
                         className="px-5 py-2 text-sm font-semibold text-gray-950 bg-yellow-400 rounded-lg shadow-md hover:bg-yellow-300 transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        {isUploading ? 'Uploading...' : 'Save Visuals'}
                    </button>
                 </div>
            )}
        </div>
    );
}