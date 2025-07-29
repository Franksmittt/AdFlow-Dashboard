// app/components/campaigns/CreativeChecklist.js

"use client";
import React from 'react';

const ChecklistItem = ({ label, isChecked }) => (
    <div className="flex items-center bg-gray-900/50 p-3 rounded-lg">
        <div className={`w-5 h-5 flex items-center justify-center rounded-full mr-3 ${isChecked ? 'bg-green-500' : 'bg-gray-700'}`}>
            {isChecked && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
            )}
        </div>
        <span className={`capitalize ${isChecked ? 'text-gray-300' : 'text-gray-500'}`}>{label.replace(/([A-Z])/g, ' $1')}</span>
    </div>
);


export default function CreativeChecklist({ campaign }) {
    // If checklist doesn't exist, default to all false to prevent errors
    const checklist = campaign.checklist || {
        primaryText: false,
        headlines: false,
        visuals: false,
        targeting: false,
        budget: false,
    };

    const checklistItems = Object.entries(checklist);
    const completedItems = checklistItems.filter(([_, isChecked]) => isChecked).length;
    const totalItems = checklistItems.length;
    const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    return (
        <div className="bg-gray-800/50 border border-gray-800 p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-white mb-4">🚀 Creative Checklist</h3>
            
            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex justify-between mb-1">
                    <span className="text-base font-medium text-yellow-400">Campaign Progress</span>
                    <span className="text-sm font-medium text-yellow-400">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                        className="bg-yellow-400 h-2.5 rounded-full transition-all duration-500" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {checklistItems.map(([key, isChecked]) => (
                    <ChecklistItem key={key} label={key} isChecked={isChecked} />
                ))}
            </div>
        </div>
    );
}