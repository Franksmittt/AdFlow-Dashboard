"use client";
import React, { useState, useEffect } from 'react';
// ✅ FIX: Corrected the import path to go up two directories (`../../`) to find the context.
import { useAppContext } from '../../context/AppContext';

const AD_FORMATS = ["1:1", "4:5", "9:16"];

export default function VisualManager({ campaign, onSave }) {
    const { uploadFile } = useAppContext();
    const [visuals, setVisuals] = useState({ "1:1": null, "4:5": null, "9:16": null });
    const [newFiles, setNewFiles] = useState({}); // To track selected files
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        // When the campaign data changes, update the local visuals state
        if (campaign.visuals) {
            setVisuals(campaign.visuals);
        } else {
            // Reset if the campaign has no visuals
            setVisuals({ "1:1": null, "4:5": null, "9:16": null });
        }
    }, [campaign]);

    const handleFileSelect = (format, e) => {
        const file = e.target.files[0];
        if (file) {
            setNewFiles(prev => ({ ...prev, [format]: file }));
            // Show a local preview of the selected image immediately
            setVisuals(prev => ({ ...prev, [format]: URL.createObjectURL(file) }));
        }
    };

    const handleSave = async () => {
        setIsUploading(true);
        const updatedVisuals = { ...visuals }; // Start with current visuals

        // Loop through only the newly selected files and upload them
        for (const format in newFiles) {
            const file = newFiles[format];
            if (file) {
                const path = `campaigns/${campaign.id}/${format}-${file.name}`;
                const downloadURL = await uploadFile(file, path);
                updatedVisuals[format] = downloadURL; // Update the URL for the uploaded file
            }
        }
        
        // Pass the final set of visual URLs up to the parent component
        onSave({ visuals: updatedVisuals });
        setNewFiles({}); // Clear the queue of new files
        setIsUploading(false);
    };

    const hasChanges = Object.keys(newFiles).length > 0;

    return (
        <div className="bg-gray-800/50 border border-gray-800 p-6 rounded-xl mt-6">
            <h3 className="text-xl font-semibold text-white mb-4">🖼️ Visual Asset Manager</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {AD_FORMATS.map((format) => (
                    <div key={format}>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Format {format}</label>
                        <div className="w-full h-48 bg-gray-900/50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700 overflow-hidden">
                            {visuals[format] ? (
                                <img src={visuals[format]} alt={`${format} visual preview`} className="w-full h-full object-contain" />
                            ) : (
                                <span className="text-gray-500 text-sm">No Image</span>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={(e) => handleFileSelect(format, e)}
                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-400 file:text-yellow-950 hover:file:bg-yellow-300 mt-3 cursor-pointer"
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