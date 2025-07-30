import React from 'react';

const Notebook = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M2 6h4"></path><path d="M2 10h4"></path>
        <path d="M2 14h4"></path><path d="M2 18h4"></path>
        <rect width="16" height="20" x="4" y="2" rx="2"></rect>
        <path d="M16 2v20"></path>
    </svg>
);

export default Notebook;