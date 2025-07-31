// app/components/campaigns/VisualManager.js
"use client";
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';

const AD_FORMATS = ["1:1", "4:5", "9:16"];

// This component handles uploading and displaying local previews of visuals.
export default function VisualManager({ campaign, onSave }) {
    const [visuals, setVisuals] = useState({ "1:1": null, "4:5": null, "9:16": null });
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        // When the campaign data changes, update the local visuals state.
        if (campaign && campaign.visuals) {
            setVisuals(campaign.visuals);
        }
        setHasChanges(false); // Reset changes on new campaign data
    }, [campaign]);

    // Clean up blob URLs to prevent memory leaks
    useEffect(() => {
        return () => {
            Object.values(visuals).forEach(url => {
                if (url && url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [visuals]);

    const handleVisualUpload = (format, e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Create a local URL for the file to show a preview.
        const newVisuals = { ...visuals, [format]: URL.createObjectURL(file) };
        setVisuals(newVisuals);
        setHasChanges(true);
        toast.success(`Preview for ${format} visual loaded.`);
    };

    const handleSaveVisuals = () => {
        // The onSave function now just updates the parent component's state.
        // It no longer uploads to Firebase.
        onSave({ ...campaign, visuals });
        setHasChanges(false);
        toast.success("Visual changes saved locally.");
    };

    return (
        <div className="bg-gray-800/50 border border-gray-800 p-6 rounded-xl mt-6">
            <h3 className="text-xl font-semibold text-white mb-4">🖼️ Visual Assets (Local Preview)</h3>
            <div className="space-y-4">
                {AD_FORMATS.map((format) => (
                    <div key={format}>
                        <label className="block text-sm font-medium text-gray-300 mb-1">{format} Visual</label>
                        <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={(e) => handleVisualUpload(format, e)}
                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-yellow-400 file:text-gray-950 hover:file:bg-yellow-300"
                        />
                        {visuals[format] && (
                            <div className="mt-4 relative w-40 h-40 bg-gray-900 rounded-lg">
                                <Image
                                    src={visuals[format]}
                                    alt={`${format} preview`}
                                    fill
                                    className="object-cover rounded-lg"
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
