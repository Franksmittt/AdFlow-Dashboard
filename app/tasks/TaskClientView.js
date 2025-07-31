// app/tasks/TaskClientView.js
"use client";
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '../components/Sidebar';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';
// CHANGE: Import the new accessible hook
import { useAccessibleKanban } from '../hooks/useAccessibleKanban'; 
import ConfirmationModal from '../components/ui/ConfirmationModal';
import SkeletonCard from '../components/ui/SkeletonCard';
import { Target, Plus, MoreVertical, Edit, Trash2 } from '../components/icons';

const TaskEditorModal = dynamic(() => import('./TaskEditorModal'), {
    loading: () => <p className="text-center p-4">Loading Editor...</p>,
    ssr: false
});
const statusConfig = {
    "To Do": { colorClass: "bg-gray-500", text: "text-gray-400" },
    "In Progress": { colorClass: "bg-blue-500", text: "text-blue-300" },
    "Done": { colorClass: "bg-green-500", text: "text-green-300" },
};
const priorityConfig = { "High": "bg-red-500", "Medium": "bg-yellow-500", "Low": "bg-green-500" };
const KANBAN_COLUMNS = ["To Do", "In Progress", "Done"];

// UPDATE: TaskCard now accepts props for keyboard accessibility
const TaskCard = ({ task, onEdit, onDelete, onDragStart, onKeyDown, isDragging, isKeyboardSelected }) => {
    const [isMenuOpen, setMenuOpen] = useState(false);
    return (
        <div 
            draggable 
            onDragStart={onDragStart} 
            // Add keyboard event handler and tabindex to make it focusable
            onKeyDown={onKeyDown}
            tabIndex={0}
            className={`bg-gray-800/80 p-4 rounded-lg cursor-grab active:cursor-grabbing transition-all ${isDragging ? 'opacity-50' : 'opacity-100'} ${isKeyboardSelected ? 'ring-2 ring-yellow-400 shadow-lg' : 'focus:ring-2 focus:ring-blue-400'}`}
            // Add ARIA attributes for screen readers
            role="button"
            aria-roledescription="Draggable task"
            aria-grabbed={isKeyboardSelected}
        >
            <div className="flex justify-between items-start mb-2">
                <p className="font-semibold text-white pr-4 break-words">{task.text}</p>
                <div className="relative flex-shrink-0">
                    <button
                        onClick={() => setMenuOpen(!isMenuOpen)}
                        onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
                        className="text-gray-500 hover:text-white"
                        aria-expanded={isMenuOpen}
                        aria-haspopup="true"
                        aria-label="Task options"
                    >
                        <MoreVertical className="w-5 h-5" />
                    </button>
                    {isMenuOpen && (
                        <div className="absolute right-0 mt-2 w-32 bg-gray-700 border border-gray-600 rounded-md shadow-lg z-10">
                            <button onClick={() => { onEdit(task); setMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-600" aria-label="Edit task">
                                <Edit className="w-4 h-4" /> Edit
                            </button>
                            <button onClick={() => { onDelete(task.id); setMenuOpen(false); }} className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-gray-600" aria-label="Delete task">
                                <Trash2 className="w-4 h-4" /> Delete
                            </button>
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

export default function TaskClientView({ initialCampaigns }) {
    const { tasks, campaigns, loading, saveData, deleteData } = useAppContext();
    // CHANGE: Use the new accessible hook
    const { 
        draggedItem, 
        keyboardSelectedItem,
        handleDragStart, 
        handleDrop, 
        handleKeyDown 
    } = useAccessibleKanban({ saveData, collectionName: 'tasks' });
    
    const [isModalOpen, setModalOpen] = useState(false);
    const [taskToEdit, setTaskToEdit] = useState(null);
    const [isConfirmOpen, setConfirmOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState(null);

    const handleOpenCreateModal = () => { setTaskToEdit(null); setModalOpen(true); };
    const handleOpenEditModal = (task) => { setTaskToEdit(task); setModalOpen(true); };

    const handleSaveTask = async (savedTask) => {
        try {
            await toast.promise(saveData('tasks', savedTask), {
                loading: 'Saving task...',
                success: 'Task saved successfully!',
                error: 'Failed to save task.',
            });
            setModalOpen(false);
        } catch (error) {
            console.error("Error saving task:", error);
        }
    };

    const handleDelete = (id) => {
        setTaskToDelete(id);
        setConfirmOpen(true);
    };

    const confirmDelete = async () => {
        if (!taskToDelete) return;
        try {
            await deleteData('tasks', taskToDelete);
            toast.success('Task deleted successfully!');
        } catch (error) {
            toast.error('Failed to delete task.');
            console.error("Error deleting task:", error);
        } finally {
            setConfirmOpen(false);
            setTaskToDelete(null);
        }
    };
    
    if (loading) {
        // Skeleton loading state remains the same...
        return (
            <div className="flex h-screen bg-gray-950">
                <Sidebar />
                <main id="main-content" className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col">
                    <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 flex-shrink-0">
                        <div>
                           <div className="h-9 bg-gray-700 rounded w-48 mb-2 animate-pulse"></div>
                           <div className="h-5 bg-gray-700 rounded w-72 animate-pulse"></div>
                        </div>
                    </header>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto">
                        {KANBAN_COLUMNS.map(status => (
                             <div key={status} className="bg-gray-900/70 rounded-xl flex flex-col min-w-[300px]">
                                <div className="p-4 border-b border-gray-800">
                                    <div className="h-6 bg-gray-700 rounded w-1/2 animate-pulse"></div>
                                 </div>
                                <div className="p-4 space-y-4">
                                    <SkeletonCard /><SkeletonCard />
                                </div>
                            </div>
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="font-sans antialiased text-gray-200">
            <div className="flex h-screen bg-gray-950">
                <Sidebar />
                <main id="main-content" className="flex-1 p-6 md:p-8 lg:p-10 flex flex-col">
                    <header className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4 flex-shrink-0">
                        <div>
                            <h2 className="text-3xl font-bold text-white">Tasks Board</h2>
                            <p className="text-gray-400 mt-1">Organize your workflow from &apos;To Do&apos; to &apos;Done&apos;.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={handleOpenCreateModal} className="px-5 py-2.5 text-sm font-semibold text-gray-950 bg-yellow-400 rounded-lg shadow-md hover:bg-yellow-300 transition-colors flex items-center justify-center gap-2 whitespace-nowrap" aria-label="Create New Task">
                                <Plus className="w-5 h-5" />Create Task
                            </button>
                        </div>
                    </header>
                     <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-x-auto">
                        {KANBAN_COLUMNS.map(status => (
                            <div 
                                key={status} 
                                onDragOver={(e) => e.preventDefault()} 
                                onDrop={(e) => handleDrop(e, status)} 
                                className="bg-gray-900/70 border-dashed border-2 border-transparent data-[is-over=true]:border-yellow-400/50 rounded-xl flex flex-col min-w-[300px]" 
                                data-is-over={!!draggedItem && draggedItem.status !== status}
                            >
                                <div className="p-4 border-b border-gray-800 flex-shrink-0">
                                    <h3 className="font-semibold text-white flex items-center gap-2">
                                        <span className={`w-3 h-3 rounded-full ${statusConfig[status].colorClass}`}></span>
                                        {status}
                                        <span className="ml-auto text-sm text-gray-500">{tasks.filter(t => t.status === status).length}</span>
                                    </h3>
                                </div>
                                <div className="p-4 space-y-4 overflow-y-auto flex-1">
                                    {tasks.filter(t => t.status === status).map(task => (
                                        <TaskCard 
                                            key={task.id} 
                                            task={task} 
                                            onEdit={handleOpenEditModal} 
                                            onDelete={handleDelete} 
                                            // Pass mouse and keyboard handlers
                                            onDragStart={(e) => handleDragStart(e, task)}
                                            onKeyDown={(e) => handleKeyDown(e, task)}
                                            // Pass state for visual indicators
                                            isDragging={draggedItem?.id === task.id}
                                            isKeyboardSelected={keyboardSelectedItem?.id === task.id}
                                        />
                                    ))}
                                </div>
                             </div>
                        ))}
                    </div>
                </main>
                {isModalOpen && (
                    <TaskEditorModal
                        isOpen={isModalOpen}
                        onClose={() => setModalOpen(false)}
                        onSave={handleSaveTask}
                        taskToEdit={taskToEdit}
                        campaigns={campaigns}
                    />
                )}
                 <ConfirmationModal
                     isOpen={isConfirmOpen}
                    onClose={() => setConfirmOpen(false)}
                    onConfirm={confirmDelete}
                    message="Are you sure you want to delete this task?"
                />
            </div>
        </div>
    );
}