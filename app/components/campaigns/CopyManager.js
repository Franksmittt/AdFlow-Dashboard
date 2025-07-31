// app/components/campaigns/CopyManager.js
"use client";
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function CopyManager({ campaign, onSave }) {
    const [primaryText, setPrimaryText] = useState('');
    const [headlines, setHeadlines] = useState(['']);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        setPrimaryText(campaign.primaryText || '');
        setHeadlines(campaign.headlines && campaign.headlines.length > 0 ? campaign.headlines : ['']);
        setHasChanges(false);
    }, [campaign]);

    const handlePrimaryTextChange = (e) => {
        setPrimaryText(e.target.value);
        setHasChanges(true);
    };

    const handleHeadlineChange = (index, value) => {
        const newHeadlines = [...headlines];
        newHeadlines[index] = value;
        setHeadlines(newHeadlines);
        setHasChanges(true);
    };

    const addHeadline = () => {
        setHeadlines([...headlines, '']);
        setHasChanges(true);
    };

    const removeHeadline = (index) => {
        if (headlines.length <= 1) return;
        const newHeadlines = headlines.filter((_, i) => i !== index);
        setHeadlines(newHeadlines);
        setHasChanges(true);
    };

    const handleSave = async () => {
        const finalHeadlines = headlines.filter(h => h.trim() !== '');
        try {
            await toast.promise(
                onSave({ primaryText, headlines: finalHeadlines }),
                {
                    loading: 'Saving copy...',
                    success: 'Copy saved successfully!',
                    error: 'Failed to save copy.',
                }
            );
            setHasChanges(false);
        } catch (error) {
            console.error("Error saving copy:", error);
        }
    };

    return (
        <div className="bg-gray-800/50 border border-gray-800 p-6 rounded-xl mt-6">
            <h3 className="text-xl font-semibold text-white mb-4">📝 Copy & Headlines</h3>
            <div>
                <label htmlFor="primaryText" className="block text-sm font-medium text-gray-300 mb-1">
                    Primary Text
                </label>
                <textarea
                    id="primaryText"
                    value={primaryText}
                    onChange={handlePrimaryTextChange}
                    className="w-full bg-gray-900 border-gray-700 rounded-lg p-2 text-white h-32"
                    rows="4"
                />
            </div>
            <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-1">Headlines</label>
                {headlines.map((headline, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                        <input
                            type="text"
                            value={headline}
                            onChange={(e) => handleHeadlineChange(index, e.target.value)}
                            className="w-full bg-gray-900 border-gray-700 rounded-lg p-2 text-white"
                            placeholder={`Headline ${index + 1}`}
                        />
                        <button
                            onClick={() => removeHeadline(index)}
                            className="text-gray-500 hover:text-red-400 disabled:opacity-50"
                            disabled={headlines.length <= 1}
                            aria-label="Remove headline"
                        >
                            &times;
                        </button>
                    </div>
                ))}
                <button
                    onClick={addHeadline}
                    className="text-yellow-400 hover:text-yellow-300 text-sm mt-2"
                >
                    + Add Headline
                </button>
            </div>
            {hasChanges && (
                <div className="flex justify-end mt-6">
                   <button
                       onClick={handleSave}
                       className="px-5 py-2 text-sm font-semibold text-gray-950 bg-yellow-400 rounded-lg shadow-md hover:bg-yellow-300 transition-colors"
                   >
                     Save Copy
                   </button>
               </div>
           )}
        </div>
    );
}