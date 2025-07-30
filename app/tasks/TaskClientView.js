// app/tasks/TaskClientView.js
"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import { useAppContext } from '../context/AppContext';
import { getFirestore, collection, onSnapshot } from 'firebase/firestore';
import { app } from '../context/firebase';

// --- ICONS & CONFIG --- //
// FIX: Corrected import paths to go up one directory
import Target from '../components/icons/Target';
import Plus from '../components/icons/Plus';
import MoreVertical from '../components/icons/MoreVertical';
import Edit from '../components/icons/Edit';
import Trash2 from '../components/icons/Trash2';


const statusConfig = {
    "To Do": { colorClass: "bg-gray-500", bg: "bg-gray-800", text: "text-gray-400" },
    "In Progress": { colorClass: "bg-blue-500", bg: "bg-blue-900/50", text: "text-blue-300" },
    "Done": { colorClass: "bg-green-500", bg: "bg-green-900/50", text: "text-green-300" },
};
const priorityConfig = { "High": "bg-red-500", "Medium": "bg-yellow-500", "Low": "bg-green-500" };
const KANBAN_COLUMNS = ["To Do", "In Progress", "Done"];

// --- SUB-COMPONENTS --- //
const TaskEditorModal = ({ isOpen, onClose, onSave, taskToEdit, campaigns }) => {
    const [text, setText] = useState('');
    const [campaignId, setCampaignId] = useState('');
    const [priority, setPriority] = useState('Medium');

    useEffect(() => {
        if (isOpen) {
            if (taskToEdit) {
                setText(taskToEdit.text || '');
                setCampaignId(taskToEdit.campaignId || (campaigns[0]?.id || ''));
                setPriority(taskToEdit.priority || 'Medium');
            } else {
                setText('');
                setCampaignId(campaigns[0]?.id || '');
                setPriority('Medium');
            }
        }
    }, [taskToEdit, isOpen, campaigns]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const linkedCampaign = campaigns.find(c => c.id === campaignId);
        const savedTask = {
            ...taskToEdit, id: taskToEdit?.id, text, priority,
            campaignId: campaignId,
            campaign: linkedCampaign ? linkedCampaign.name : 'Unassigned',
            status: taskToEdit?.status || 'To Do'
        };
        onSave(savedTask);
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-gray-900 border border-gray-800 w-full max-w-lg rounded-xl shadow-2xl m-4" onClick={(e) => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="flex items-center justify-between p-6 border-b border-gray-800">
                        <h3 className="text-xl font-semibold text-white">{taskToEdit ? 'Edit Task' : 'Create New Task'}</h3>
                        <button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button>
                    </div>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="taskText" className="block text-sm font-medium text-gray-300 mb-1">Task Description</label>
                            <input type="text" name="taskText" id="taskText" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g., Design new video creative" required className="w-full bg-gray-800 border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="w-full">
                                <label htmlFor="campaign" className="block text-sm font-medium text-gray-300 mb-1">Link to Campaign</label>
                                <select name="campaign" id="campaign" value={campaignId} onChange={(e) => setCampaignId(e.target.value)} className="w-full bg-gray-800 border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400">
                                    <option value="">Unassigned</option>
                                    {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="w-full">
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

const TaskCard = ({ task, onEdit, onDelete, onDragStart, isDragging }) => {
    const [isMenuOpen, setMenuOpen] = useState(false);
    return (
        <div draggable onDragStart={onDragStart} className={`bg-gray-800/80 p-4 rounded-lg cursor-grab active:cursor-grabbing transition-opacity ${isDragging ? 'opacity-50' : 'opacity-100'}`}>
            <div className="flex justify-between items-start mb-2">
                <p className="font-semibold text-white pr-4 break-words">{task.text}</p>
                <div className="relative flex-shrink-0">
                    <button onClick={() => setMenuOpen(!isMenuOpen)} onBlur={() => setTimeout(() => setMenuOpen(false), 100)} className="text-gray-500 hover:text-white">
                        <MoreVertical className="w-5 h-5" />
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-32 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-10">
                            <button onClick={() => { onEdit(task); setMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"><Edit className="w-4 h-4" /> Edit</button>
                            <button onClick={() => { onDelete(task.id); setMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-600"><Trash2 className="w-4 h-4" /> Delete</button>
                        </div>
                    )}
                </div>
            </div>
            <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-blue-400 bg-blue-900/50 px-2 py-0.5 rounded-full flex items-center gap-1.5">
                    <Target className="w-3 h-3" />
                    {task.campaign || 'Unassigned'}
                </p>
                <span className={`w-3 h-3 rounded-full ${priorityConfig[task.priority]}`} title={`Priority: ${task.priority}`}></span>
            </div>
        </div>
    );
};


// --- MAIN CLIENT COMPONENT --- //
export default function TaskClientView({ initialTasks, initialCampaigns }) {
    const { saveData, deleteData, campaigns } = useAppContext();
    const [tasks, setTasks] = useState(initialTasks);
    const [isModalOpen, setModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [draggedTask, setDraggedTask] = useState(null);

    useEffect(() => {
        const db = getFirestore(app);
        const unsubscribe = onSnapshot(collection(db, 'tasks'), (snapshot) => {
            const updatedTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTasks(updatedTasks);
        });
        return () => unsubscribe();
    }, []);
    
    const handleOpenCreateModal = () => { setTaskToEdit(null); setModalOpen(true); };
    const handleOpenEditModal = (task) => { setTaskToEdit(task); setModalOpen(true); };
    
    const handleSaveTask = async (savedTask) => {
        try {
            await saveData('tasks', savedTask);
            setModalOpen(false);
        } catch (error) {
            console.error("Error saving task:", error);
            alert("Failed to save task.");
        }
    };
    
    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this task?")) {
            await deleteData('tasks', id);
        }
    };
    
    const handleDragStart = (e, task) => { setDraggedTask(task); e.dataTransfer.effectAllowed = 'move'; };
    const handleDragOver = (e) => { e.preventDefault(); };
    
    const handleDrop = async (e, newStatus) => {
        e.preventDefault();
        if (draggedTask && draggedTask.status !== newStatus) {
            const updatedTask = { ...draggedTask, status: newStatus };
            await saveData('tasks', updatedTask);
        }
        setDraggedTask(null);
    };

    return (
        <div className="font-sans antialiased text-gray-200">
            <div className="flex h-screen bg-gray-950">
                <Sidebar />
                <main className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col">
                    <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 flex-shrink-0">
                        <div>
                            <h2 className="text-3xl font-bold text-white">Tasks Board</h2>
                            <p className="text-gray-400 mt-1">Organize your workflow from &apos;To Do&apos; to &apos;Done&apos;.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleOpenCreateModal} className="px-5 py-2.5 text-sm font-semibold text-gray-950 bg-yellow-400 rounded-lg shadow-md hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"><Plus className="w-5 h-5" />Create Task</button>
                        </div>
                    </header>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto">
                        {KANBAN_COLUMNS.map(status => (
                            <div key={status} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, status)} className="bg-gray-900/70 border-dashed border-2 border-transparent data-[is-over=true]:border-yellow-400/50 rounded-xl flex flex-col min-w-[300px]" data-is-over={draggedTask && draggedTask.status !== status}>
                                <div className="p-4 border-b border-gray-800 flex-shrink-0">
                                    <h3 className="font-semibold text-white flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded-full ${statusConfig[status].colorClass}`}></span>
                                        {status}
                                        <span className="ml-auto text-sm text-gray-500">{tasks.filter(t => t.status === status).length}</span>
                                    </h3>
                                </div>
                                <div className="p-4 space-y-4 overflow-y-auto flex-1">
                                    {tasks.filter(t => t.status === status).map(task => (
                                        <TaskCard key={task.id} task={task} onEdit={handleOpenEditModal} onDelete={handleDelete} onDragStart={(e) => handleDragStart(e, task)} isDragging={draggedTask?.id === task.id} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
                <TaskEditorModal 
                    isOpen={isModalOpen} 
                    onClose={() => setModalOpen(false)} 
                    onSave={handleSaveTask} 
                    taskToEdit={taskToEdit} 
                    campaigns={campaigns} 
                />
            </div>
        </div>
    );
}