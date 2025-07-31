// app/components/ui/SkeletonCard.js
"use client";

export default function SkeletonCard() {
    return (
        <div className="bg-gray-800/50 border border-gray-800 p-5 rounded-xl animate-pulse">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-700 rounded w-1/2"></div>
        </div>
    );
}