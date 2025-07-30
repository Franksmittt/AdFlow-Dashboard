import React from 'react';

const BatteryIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16,2H8A4,4,0,0,0,4,6V18a4,4,0,0,0,4,4h8a4,4,0,0,0,4-4V6A4,4,0,0,0,16,2Zm-4,3a1,1,0,0,1,1,1V8a1,1,0,0,1-2,0V6A1,1,0,0,1,12,5Zm-2,9H8a1,1,0,0,1,0-2h2a1,1,0,0,1,0,2Zm4,0H14a1,1,0,0,1,0-2h2a1,1,0,0,1,0,2Z" />
    </svg>
);

export default BatteryIcon;