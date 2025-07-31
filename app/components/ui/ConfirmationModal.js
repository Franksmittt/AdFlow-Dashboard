// app/components/ui/ConfirmationModal.js
"use client";
import React from 'react';

export default function ConfirmationModal({ isOpen, onClose, onConfirm, message, confirmText = "Confirm", confirmColor = "bg-red-500" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50" role="alertdialog" aria-modal="true" aria-labelledby="confirmation-message">
      <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl shadow-2xl m-4 max-w-sm w-full">
        <p id="confirmation-message" className="text-white mb-6 text-lg">{message}</p>
        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 text-sm font-medium bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">Cancel</button>
          <button onClick={onConfirm} className={`px-5 py-2 text-sm font-semibold text-gray-950 ${confirmColor} rounded-lg hover:opacity-90 transition-colors`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};