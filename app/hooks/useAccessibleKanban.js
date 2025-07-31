// app/hooks/useAccessibleKanban.js
"use client";
import { useState } from 'react';
import toast from 'react-hot-toast';

export function useAccessibleKanban({ saveData, collectionName, columns }) {
  const [draggedItem, setDraggedItem] = useState(null);
  const [keyboardSelectedItem, setKeyboardSelectedItem] = useState(null);

  // Mouse drag-and-drop handlers
  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (draggedItem && draggedItem.status !== newStatus) {
      await updateItemStatus(draggedItem, newStatus);
    }
    setDraggedItem(null);
  };

  // Keyboard interaction handler
  const handleKeyDown = async (e, item) => {
    // On Space or Enter, select/deselect the item
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (keyboardSelectedItem?.id === item.id) {
        setKeyboardSelectedItem(null); // Deselect
        toast.success(`${collectionName.slice(0, -1)} deselected.`);
      } else {
        setKeyboardSelectedItem(item); // Select
        toast.success(`${collectionName.slice(0, -1)} selected. Use arrow keys to move.`);
      }
    }

    // On Escape, cancel selection
    if (e.key === 'Escape' && keyboardSelectedItem) {
      e.preventDefault();
      setKeyboardSelectedItem(null);
      toast.success('Move cancelled.');
    }

    // On ArrowRight or ArrowLeft, move the selected item
    if ((e.key === 'ArrowRight' || e.key === 'ArrowLeft') && keyboardSelectedItem && keyboardSelectedItem.id === item.id) {
        e.preventDefault();
        const currentIndex = columns.indexOf(keyboardSelectedItem.status);
        
        let newIndex;
        if (e.key === 'ArrowRight') {
            newIndex = Math.min(currentIndex + 1, columns.length - 1);
        } else { // ArrowLeft
            newIndex = Math.max(currentIndex - 1, 0);
        }

        if (newIndex !== currentIndex) {
            const newStatus = columns[newIndex];
            await updateItemStatus(keyboardSelectedItem, newStatus);
            // Keep the item selected but update its status for the next move
            setKeyboardSelectedItem(prev => ({ ...prev, status: newStatus }));
        }
    }
  };
  
  // Helper function to save the updated item
  const updateItemStatus = async (item, newStatus) => {
    const updatedItem = { ...item, status: newStatus };
    try {
      await saveData(collectionName, updatedItem);
      toast.success(`Status updated to ${newStatus}!`);
    } catch (error) {
      console.error(`Error updating ${collectionName} status:`, error);
      toast.error(`Failed to update status.`);
    }
  };

  return { 
    draggedItem, 
    keyboardSelectedItem,
    handleDragStart, 
    handleDrop, 
    handleKeyDown 
  };
}