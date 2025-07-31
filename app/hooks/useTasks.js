// app/hooks/useTasks.js
"use client";
import { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import toast from 'react-hot-toast';

export function useTasks() {
  const { saveData } = useAppContext();
  const [draggedTask, setDraggedTask] = useState(null);

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== newStatus) {
      const updatedTask = { ...draggedTask, status: newStatus };
      try {
        await saveData('tasks', updatedTask);
        toast.success(`Task status updated to ${newStatus}!`);
      } catch (error) {
        console.error("Error updating task status:", error);
        toast.error('Failed to update task status.');
      }
    }
    setDraggedTask(null);
  };
  
  return { draggedTask, handleDragStart, handleDrop };
}