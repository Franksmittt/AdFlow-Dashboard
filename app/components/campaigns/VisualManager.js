// app/components/campaigns/VisualManager.js
"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { useAppContext } from '../../context/AppContext'; // Import the context

const AD_FORMATS = ["1:1", "4:5", "9:16"];

export default function VisualManager({ campaign, onSave }) {
    const { uploadFile } = useAppContext(); // Get the uploadFile function
    const [visuals, setVisuals] = useState({ "1:1": null, "4:5": null, "9:16": null });
    const [hasChanges, setHasChanges] = useState(false);
    const [isUploading, setIsUploading] = useState(null); // Track uploading state for each format

    useEffect(() => {
        if (campaign && campaign.visuals) {
            setVisuals(campaign.visuals);
        }
        setHasChanges(false);
    }, [campaign]);

    const handleVisualUpload = async (format, e) => {
        const file = e.target.files[0];
        if (!file) return;

        setIsUploading(format);
        const toastId = toast.loading(`Uploading ${format} visual...`);

        try {
            // Use the new uploadFile function from context
            const downloadURL = await uploadFile(file, 'campaign-visuals');
            
            setVisuals(prev => ({ ...prev, [format]: downloadURL }));
            setHasChanges(true);
            toast.success(`Visual for ${format} uploaded!`, { id: toastId });
        } catch (error) {
            console.error("File upload error:", error);
            toast.error("Upload failed. Please try again.", { id: toastId });
        } finally {
            setIsUploading(null);
        }
    };

    const handleSaveVisuals = () => {
        onSave({ ...campaign, visuals });
        setHasChanges(false);
        // Toast is now handled by the parent component's onSave
    };

    return (
        <div className="bg-gray-800/50 border border-gray-800 p-6 rounded-xl mt-6">
            <h3 className="text-xl font-semibold text-white mb-4">🖼️ Visual Assets</h3>
            <div className="space-y-4">
                {AD_FORMATS.map((format) => (
                    <div key={format}>
                        <label className="block text-sm font-medium text-gray-300 mb-1">{format} Visual</label>
                        <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={(e) => handleVisualUpload(format, e)}
                            disabled={isUploading === format}
                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-400 file:text-gray-950 hover:file:bg-yellow-300 disabled:file:bg-gray-500"
                        />
                        {isUploading === format && <p className="text-xs text-yellow-400 mt-1">Uploading, please wait...</p>}
                        {visuals[format] && (
                            <div className="mt-4 relative w-40 h-40 bg-gray-900 rounded-lg">
                                <Image
                                    src={visuals[format]}
                                    alt={`${format} preview`}
                                    fill
                                    className="object-cover rounded-lg"
                                    onError={(e) => { e.target.style.display = 'none'; }}
                                />
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {hasChanges && (
                 <div className="flex justify-end mt-6">
                    <button
                        onClick={handleSaveVisuals}
                        className="px-5 py-2 text-sm font-semibold text-gray-950 bg-yellow-400 rounded-lg shadow-md hover:bg-yellow-300 transition-colors"
                    >
                      Save Visuals
                    </button>
                </div>
            )}
        </div>
    );
}
