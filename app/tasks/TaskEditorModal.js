// app/tasks/TaskEditorModal.js
"use client";
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { z } from 'zod';

const KANBAN_COLUMNS = ["To Do", "In Progress", "Done"];

const taskSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1, { message: "Task description is required." }),
  priority: z.enum(['High', 'Medium', 'Low']),
  campaignId: z.string().optional().nullable(),
  campaign: z.string().optional().nullable(),
  status: z.enum(KANBAN_COLUMNS),
});

export default function TaskEditorModal({ isOpen, onClose, onSave, taskToEdit, campaigns }) {
    const [text, setText] = useState('');
    const [campaignId, setCampaignId] = useState('');
    const [priority, setPriority] = useState('Medium');
    const modalRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            if (taskToEdit) {
                setText(taskToEdit.text || '');
                setCampaignId(taskToEdit.campaignId || '');
                setPriority(taskToEdit.priority || 'Medium');
            } else {
                setText('');
                setCampaignId('');
                setPriority('Medium');
            }
            if (modalRef.current) {
                modalRef.current.focus();
            }
        }
    }, [taskToEdit, isOpen, campaigns]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!text.trim()) {
            toast.error("Task description cannot be empty.");
            return;
        }
        const linkedCampaign = campaigns.find(c => c.id === campaignId);
        const savedTask = {
            ...taskToEdit,
            id: taskToEdit?.id,
            text,
            priority,
            campaignId: campaignId || null,
            campaign: linkedCampaign ? linkedCampaign.name : 'Unassigned',
            status: taskToEdit?.status || 'To Do'
        };
        const result = taskSchema.safeParse(savedTask);
        if (!result.success) {
            toast.error(`Validation failed: ${result.error.errors.map(err => err.message).join(', ')}`);
            return;
        }
        onSave(result.data);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div ref={modalRef} tabIndex="-1" className="bg-gray-900 border border-gray-800 w-full max-w-lg rounded-xl shadow-2xl m-4" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center justify-between p-6 border-b border-gray-800">
                         <h3 className="text-xl font-semibold text-white">{taskToEdit ? 'Edit Task' : 'Create New Task'}</h3>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none" aria-label="Close modal">&times;</button>
                    </div>
                    <div className="p-6 space-y-4">
                         <div>
                            <label htmlFor="taskText" className="block text-sm font-medium text-gray-300 mb-1">Task Description</label>
                            <input type="text" name="taskText" id="taskText" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g., Design new video creative" required className="w-full bg-gray-800 border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                 <label htmlFor="campaign" className="block text-sm font-medium text-gray-300 mb-1">Link to Campaign</label>
                                <select name="campaign" id="campaign" value={campaignId} onChange={(e) => setCampaignId(e.target.value)} className="w-full bg-gray-800 border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400" disabled={!campaigns.length}>
                                    <option value="">Unassigned</option>
                                    {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                 {!campaigns.length && <p className="text-sm text-gray-500 mt-1">No campaigns available to link.</p>}
                            </div>
                            <div>
                                 <label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-1">Priority</label>
                                <select name="priority" id="priority" value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full bg-gray-800 border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400">
                                    <option>High</option><option>Medium</option><option>Low</option>
                                </select>
                            </div>
                        </div>
                     </div>
                    <div className="flex items-center justify-end p-6 border-t border-gray-800 space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-semibold text-gray-950 bg-yellow-400 rounded-lg hover:bg-yellow-300 transition-colors">Save Task</button>
                    </div>
                </form>
            </div>
        </div>
    );
};