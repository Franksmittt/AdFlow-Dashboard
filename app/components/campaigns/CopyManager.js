// app/components/campaigns/CopyManager.js
"use client";
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

// A new button component for triggering AI generation
const AIGenerateButton = ({ onClick, isLoading, children }) => (
    <button
        type="button"
        onClick={onClick}
        disabled={isLoading}
        className="flex items-center gap-2 text-sm text-yellow-400 hover:text-yellow-300 disabled:text-gray-500 disabled:cursor-wait transition-colors"
    >
        <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9.9 2.1C8.7 2.5 7.5 3.3 6.5 4.2l-1.4 1.4C4.3 6.4 4 7.2 4 8c0 .8.3 1.6.9 2.2l7.1 7.1c.6.6 1.4.9 2.2.9.8 0 1.6-.3 2.2-.9l1.4-1.4c.9-.9 1.7-2.1 2.1-3.3-.4.2-.8.4-1.3.5-1.3.4-2.6-.2-3.5-1.1l-7-7C9.3 4.3 8.7 3 7.4 2.6c.1-.1.3-.2.4-.3.2-.2.4-.3.6-.5 1.2-.8 2.6-1.2 4-.1zM2.1 14.1A9.9 9.9 0 0 1 12 4.5c.3 0 .6.1.9.1.5 0 1 .1 1.4.2l-1.5 1.5c-1 1-1.5 2.3-1.4 3.6.1 1.3.7 2.5 1.7 3.4l1.5 1.5c-.1.5-.1 1-.2 1.4-.1.3-.1.6-.1.9-4.6.9-8.3-2.8-9.2-7.4-.1-.5-.1-1-.1-1.4 0-.8.3-1.6.9-2.2l1.4-1.4C9.6 7.5 10.5 8.3 11 9.5c.4 1.3-.2 2.6-1.1 3.5l-2 2c-.6.6-.9 1.4-.9 2.2z"/>
        </svg>
        {isLoading ? 'Generating...' : children}
    </button>
);

// A new component to display AI suggestions
const SuggestionsBox = ({ title, suggestions, onSelect, onClear }) => {
    if (!suggestions || suggestions.length === 0) return null;

    return (
        <div className="mt-4 p-4 bg-gray-900/70 border border-gray-700 rounded-lg">
            <div className="flex justify-between items-center mb-2">
                <h4 className="text-md font-semibold text-white">{title}</h4>
                <button onClick={onClear} className="text-xs text-gray-500 hover:text-white">&times; Clear</button>
            </div>
            <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                    <div key={index} onClick={() => onSelect(suggestion)} className="p-3 bg-gray-800 rounded-md cursor-pointer hover:bg-yellow-900/50 transition-colors">
                        <p className="text-gray-300 text-sm">{suggestion}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};


export default function CopyManager({ campaign, onSave }) {
    const [primaryText, setPrimaryText] = useState('');
    const [headlines, setHeadlines] = useState(['']);
    const [hasChanges, setHasChanges] = useState(false);
    
    // New state for AI features
    const [isGenerating, setIsGenerating] = useState(false);
    const [aiSuggestions, setAiSuggestions] = useState({ primaryText: [], headlines: [] });

    useEffect(() => {
        setPrimaryText(campaign.primaryText || '');
        setHeadlines(campaign.headlines && campaign.headlines.length > 0 ? campaign.headlines : ['']);
        setHasChanges(false); // Reset changes when campaign prop changes
        setAiSuggestions({ primaryText: [], headlines: [] }); // Clear AI suggestions
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
        if (headlines.length <= 1) return; // Prevent removing the last one
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

    // --- NEW AI FUNCTIONALITY ---
    const handleGenerateCopy = async () => {
        setIsGenerating(true);
        setAiSuggestions({ primaryText: [], headlines: [] }); // Clear old suggestions
        toast('🤖 Generating AI copy suggestions...', { icon: '🧠' });

        // Construct a detailed prompt for better results
        const prompt = `
            You are an expert Facebook advertising copywriter. 
            Generate ad copy for a campaign with the following details:
            - Campaign Name: "${campaign.name}"
            - Campaign Objective: "${campaign.objective}"
            - Business Branch: "${campaign.branch}"
            - Business Description: A leading retailer of car batteries and power solutions in South Africa.

            Please provide 3 distinct options for the primary ad text and 5 distinct options for the headlines.
            The tone should be direct, persuasive, and tailored for Facebook users.
            
            Return the response as a valid JSON object with two keys: "primaryTextSuggestions" and "headlineSuggestions". 
            Each key should contain an array of strings.
            Example format: 
            {
                "primaryTextSuggestions": ["Option 1...", "Option 2...", "Option 3..."],
                "headlineSuggestions": ["Headline 1", "Headline 2", "Headline 3", "Headline 4", "Headline 5"]
            }
        `;

        try {
            let chatHistory = [];
            chatHistory.push({ role: "user", parts: [{ text: prompt }] });
            const payload = { 
                contents: chatHistory,
                generationConfig: {
                    responseMimeType: "application/json",
                }
            };
            const apiKey = ""; // This will be handled by the environment
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`API request failed with status ${response.status}`);
            }

            const result = await response.json();
            
            if (result.candidates && result.candidates.length > 0 &&
                result.candidates[0].content && result.candidates[0].content.parts &&
                result.candidates[0].content.parts.length > 0) {
                
                const text = result.candidates[0].content.parts[0].text;
                const parsedJson = JSON.parse(text);

                setAiSuggestions({
                    primaryText: parsedJson.primaryTextSuggestions || [],
                    headlines: parsedJson.headlineSuggestions || []
                });
                toast.success('AI suggestions are ready!');
            } else {
                throw new Error('Unexpected API response structure.');
            }

        } catch (error) {
            console.error("Error generating AI copy:", error);
            toast.error("Couldn't generate AI suggestions. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="bg-gray-800/50 border border-gray-800 p-6 rounded-xl mt-6">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold text-white">📝 Copy & Headlines</h3>
                <AIGenerateButton onClick={handleGenerateCopy} isLoading={isGenerating}>
                    Generate with AI
                </AIGenerateButton>
            </div>
            
            {/* Suggestions Box for Primary Text */}
            <SuggestionsBox
                title="AI Primary Text Suggestions"
                suggestions={aiSuggestions.primaryText}
                onSelect={(text) => {
                    setPrimaryText(text);
                    setHasChanges(true);
                }}
                onClear={() => setAiSuggestions(prev => ({ ...prev, primaryText: [] }))}
            />

            {/* Primary Text Input */}
            <div className="mt-4">
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
            
             {/* Suggestions Box for Headlines */}
            <SuggestionsBox
                title="AI Headline Suggestions"
                suggestions={aiSuggestions.headlines}
                onSelect={(text) => {
                    // Replace the first empty headline or add a new one
                    const emptyIndex = headlines.findIndex(h => h.trim() === '');
                    if (emptyIndex !== -1) {
                        const newHeadlines = [...headlines];
                        newHeadlines[emptyIndex] = text;
                        setHeadlines(newHeadlines);
                    } else {
                        setHeadlines([...headlines, text]);
                    }
                    setHasChanges(true);
                }}
                onClear={() => setAiSuggestions(prev => ({ ...prev, headlines: [] }))}
            />

            {/* Headlines Input */}
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
