// app/components/campaigns/VisualManager.js

"use client";
import React, { useState, useEffect } from 'react';

const AD_FORMATS = ["1:1", "4:5", "9:16"];

export default function VisualManager({ campaign, onSave }) {
    const [visuals, setVisuals] = useState({ "1:1": null, "4:5": null, "9:16": null });
    const [hasChanges, setHasChanges] = useState(false);

    // When the campaign data is loaded, populate the state
    useEffect(() => {
        if (campaign.visuals) {
            setVisuals(campaign.visuals);
        }
    }, [campaign]);

    const handleVisualUpload = (format, e) => {
        const file = e.target.files[0];
        if (file) {
            const newVisuals = { ...visuals, [format]: URL.createObjectURL(file) };
            setVisuals(newVisuals);
            setHasChanges(true);
        }
    };

    const handleSave = () => {
        onSave({ visuals });
        setHasChanges(false);
    };

    return (
        <div className="bg-gray-800/50 border border-gray-800 p-6 rounded-xl mt-6">
            <h3 className="text-xl font-semibold text-white mb-4">🖼️ Visual Asset Manager</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {AD_FORMATS.map((format) => (
                    <div key={format}>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Format {format}</label>
                        <div className="w-full h-48 bg-gray-900/50 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-700">
                            {visuals[format] ? (
                                <img src={visuals[format]} alt={`${format} visual preview`} className="w-full h-full object-contain rounded-lg" />
                            ) : (
                                <span className="text-gray-500">No Image</span>
                            )}
                        </div>
                        <input
                            type="file"
                            accept="image/*,video/*"
                            onChange={(e) => handleVisualUpload(format, e)}
                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-yellow-400 file:text-yellow-950 hover:file:bg-yellow-300 mt-3"
                        />
                    </div>
                ))}
            </div>

            {hasChanges && (
                 <div className="flex justify-end mt-6">
                    <button 
                        onClick={handleSave}
                        className="px-5 py-2 text-sm font-semibold text-gray-950 bg-yellow-400 rounded-lg shadow-md hover:bg-yellow-300 transition-colors"
                    >
                        Save Visuals
                    </button>
                </div>
            )}
        </div>
    );
}