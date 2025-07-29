"use client";

import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar'; // Using the reusable component
import { useAppContext } from '../context/AppContext'; // 1. Import the context

// --- ICONS --- //
const Target = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>;
const Plus = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>;
const MoreVertical = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>;
const Edit = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const Trash2 = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"></path><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>;
const Upload = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>;
const Download = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>;

// --- CONFIG --- //
const statusConfig = {
    "To Do": { color: "gray", bg: "bg-gray-800", text: "text-gray-400" },
    "In Progress": { color: "blue", bg: "bg-blue-900/50", text: "text-blue-300" },
    "Done": { color: "green", bg: "bg-green-900/50", text: "text-green-300" },
};

const priorityConfig = { "High": "bg-red-500", "Medium": "bg-yellow-500", "Low": "bg-green-500" };
const KANBAN_COLUMNS = ["To Do", "In Progress", "Done"];

// --- REUSABLE COMPONENTS --- //
const TaskEditorModal = ({ isOpen, onClose, onSave, taskToEdit, campaigns }) => {
    const [text, setText] = useState('');
    const [campaign, setCampaign] = useState(campaigns[0]?.name || '');
    const [priority, setPriority] = useState('Medium');

    useEffect(() => {
        if (taskToEdit) {
            setText(taskToEdit.text);
            setCampaign(taskToEdit.campaign);
            setPriority(taskToEdit.priority);
        } else {
            setText('');
            setCampaign(campaigns[0]?.name || '');
            setPriority('Medium');
        }
    }, [taskToEdit, isOpen, campaigns]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const savedTask = { ...taskToEdit, id: taskToEdit ? taskToEdit.id : Date.now(), text, campaign, priority, status: taskToEdit ? taskToEdit.status : 'To Do' };
        onSave(savedTask);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"><div className="bg-gray-900 border border-gray-800 w-full max-w-lg rounded-xl shadow-2xl m-4" onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleSubmit}>
                <div className="flex items-center justify-between p-6 border-b border-gray-800"><h3 className="text-xl font-semibold text-white">{taskToEdit ? 'Edit Task' : 'Create New Task'}</h3><button type="button" onClick={onClose} className="text-gray-400 hover:text-white text-3xl leading-none">&times;</button></div>
                <div className="p-6 space-y-4">
                    <div><label htmlFor="taskText" className="block text-sm font-medium text-gray-300 mb-1">Task Description</label><input type="text" name="taskText" id="taskText" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g., Design new video creative" required className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400" /></div>
                    <div className="flex gap-4">
                        <div className="w-1/2"><label htmlFor="campaign" className="block text-sm font-medium text-gray-300 mb-1">Link to Campaign</label><select name="campaign" id="campaign" value={campaign} onChange={(e) => setCampaign(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400">{campaigns.map(c => <option key={c.id}>{c.name}</option>)}</select></div>
                        <div className="w-1/2"><label htmlFor="priority" className="block text-sm font-medium text-gray-300 mb-1">Priority</label><select name="priority" id="priority" value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"><option>High</option><option>Medium</option><option>Low</option></select></div>
                    </div>
                </div>
                <div className="flex items-center justify-end p-6 border-t border-gray-800 space-x-2"><button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">Cancel</button><button type="submit" className="px-4 py-2 text-sm font-semibold text-gray-950 bg-yellow-400 rounded-lg hover:bg-yellow-300 transition-colors">Save Task</button></div>
            </form>
        </div></div>
    );
};

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;
    return <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50"><div className="bg-gray-900 border border-gray-800 rounded-xl shadow-2xl m-4 p-6 text-center"><h3 className="text-xl font-semibold text-white mb-4">Are you sure?</h3><p className="text-gray-400 mb-6">This action cannot be undone.</p><div className="flex justify-center gap-4"><button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">Cancel</button><button onClick={onConfirm} className="px-4 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-500 transition-colors">Delete Task</button></div></div></div>;
};

// --- MAIN PAGE COMPONENT --- //
export default function TasksPage() {
    // 2. Get data from the central context
    const { tasks, setTasks, campaigns } = useAppContext();
    
    const [isModalOpen, setModalOpen] = useState(false);
    const [isDeleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [taskIdToDelete, setTaskIdToDelete] = useState(null);
    const fileInputRef = useRef(null);
    
    // Drag and Drop State
    const [draggedTask, setDraggedTask] = useState(null);

    // 3. Remove the local useState and useEffect for data management

    const handleOpenCreateModal = () => { setTaskToEdit(null); setModalOpen(true); };
    const handleOpenEditModal = (task) => { setTaskToEdit(task); setModalOpen(true); };
    const handleDeleteRequest = (id) => { setTaskIdToDelete(id); setDeleteConfirmOpen(true); };

    const handleSaveTask = (savedTask) => {
        const taskExists = tasks.some(task => task.id === savedTask.id);
        if (taskExists) { setTasks(tasks.map(task => task.id === savedTask.id ? savedTask : task)); } else { setTasks(prev => [savedTask, ...prev]); }
        setModalOpen(false);
    };

    const confirmDelete = () => { setTasks(tasks.filter(task => task.id !== taskIdToDelete)); setDeleteConfirmOpen(false); setTaskIdToDelete(null); };
    
    // Drag and Drop Handlers
    const handleDragStart = (e, task) => { setDraggedTask(task); e.dataTransfer.effectAllowed = 'move'; };
    const handleDragOver = (e) => { e.preventDefault(); };
    const handleDrop = (e, newStatus) => {
        e.preventDefault();
        setTasks(tasks.map(task => task.id === draggedTask.id ? { ...task, status: newStatus } : task));
        setDraggedTask(null);
    };

    const handleExport = () => {
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(tasks, null, 2))}`;
        const link = document.createElement("a");
        link.href = jsonString;
        link.download = "adflow-tasks-export.json";
        link.click();
    };

    const handleImport = (event) => {
        const fileReader = new FileReader();
        fileReader.readAsText(event.target.files[0], "UTF-8");
        fileReader.onload = e => {
            try { const importedTasks = JSON.parse(e.target.result); if (Array.isArray(importedTasks)) { setTasks(importedTasks); } else { alert("Invalid file format."); } } catch (error) { alert("Failed to parse file."); console.error("Import error:", error); }
        };
        event.target.value = null;
    };

    return (
        <div className="font-sans antialiased text-gray-200">
            <div className="flex h-screen bg-gray-950">
                <Sidebar />
                <main className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col">
                    <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 flex-shrink-0">
                        <div><h2 className="text-3xl font-bold text-white">Tasks Board</h2><p className="text-gray-400 mt-1">Organize your workflow from &apos;To Do&apos; to &apos;Done&apos;.</p></div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => fileInputRef.current.click()} className="px-4 py-2.5 text-sm font-medium bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"><Upload className="w-4 h-4" /> Import</button>
                            <input type="file" ref={fileInputRef} onChange={handleImport} accept=".json" className="hidden" />
                            <button onClick={handleExport} className="px-4 py-2.5 text-sm font-medium bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"><Download className="w-4 h-4" /> Export</button>
                            <button onClick={handleOpenCreateModal} className="px-5 py-2.5 text-sm font-semibold text-gray-950 bg-yellow-400 rounded-lg shadow-md hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2 whitespace-nowrap"><Plus className="w-5 h-5" />Create Task</button>
                        </div>
                    </header>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto">
                        {KANBAN_COLUMNS.map(status => (
                            <div key={status} onDragOver={handleDragOver} onDrop={(e) => handleDrop(e, status)} className="bg-gray-900/70 border-dashed border-2 border-transparent data-[is-over=true]:border-yellow-400 rounded-xl flex flex-col min-w-[300px]" data-is-over={draggedTask && draggedTask.status !== status}>
                                <div className="p-4 border-b border-gray-800 flex-shrink-0"><h3 className="font-semibold text-white flex items-center gap-2"><span className={`w-3 h-3 rounded-full bg-${statusConfig[status].color}-400`}></span>{status}<span className="ml-auto text-sm text-gray-500">{tasks.filter(t => t.status === status).length}</span></h3></div>
                                <div className="p-4 space-y-4 overflow-y-auto flex-1">
                                    {tasks.filter(t => t.status === status).map(task => (
                                        <TaskCard key={task.id} task={task} onEdit={handleOpenEditModal} onDelete={handleDeleteRequest} onDragStart={(e) => handleDragStart(e, task)} isDragging={draggedTask && draggedTask.id === task.id} />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
                <TaskEditorModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} onSave={handleSaveTask} taskToEdit={taskToEdit} campaigns={campaigns} />
                <DeleteConfirmationModal isOpen={isDeleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)} onConfirm={confirmDelete} />
            </div>
        </div>
    );
}

const TaskCard = ({ task, onEdit, onDelete, onDragStart, isDragging }) => {
    const [isMenuOpen, setMenuOpen] = useState(false);
    return (
        <div draggable onDragStart={onDragStart} className={`bg-gray-800/80 p-4 rounded-lg cursor-grab active:cursor-grabbing transition-opacity ${isDragging ? 'opacity-50' : 'opacity-100'}`}>
            <div className="flex justify-between items-start mb-2">
                <p className="font-semibold text-white pr-4">{task.text}</p>
                <div className="relative flex-shrink-0">
                    <button onClick={() => setMenuOpen(!isMenuOpen)} onBlur={() => setTimeout(() => setMenuOpen(false), 100)} className="text-gray-500 hover:text-white"><MoreVertical className="w-5 h-5" /></button>
                    {isMenuOpen && (<div className="absolute right-0 mt-2 w-32 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-10">
                        <button onClick={() => { onEdit(task); setMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"><Edit className="w-4 h-4" /> Edit</button>
                        <button onClick={() => { onDelete(task.id); setMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-600"><Trash2 className="w-4 h-4" /> Delete</button>
                    </div>)}
                </div>
            </div>
            <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-blue-400 bg-blue-900/50 px-2 py-0.5 rounded-full flex items-center gap-1.5"><Target className="w-3 h-3" />{task.campaign}</p>
                <span className={`w-3 h-3 rounded-full ${priorityConfig[task.priority]}`} title={`Priority: ${task.priority}`}></span>
            </div>
        </div>
    );
};
