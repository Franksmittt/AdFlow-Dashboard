// app/components/GlobalSearch.js
"use client";
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAppContext } from '../context/AppContext';
import Fuse from 'fuse.js';
import Link from 'next/link';
import { Search, Target, CheckSquare, Notebook } from './icons';

const ResultItem = ({ item, onClick }) => {
    const iconMap = {
        campaign: <Target className="w-5 h-5 text-blue-400" />,
        task: <CheckSquare className="w-5 h-5 text-yellow-400" />,
        note: <Notebook className="w-5 h-5 text-purple-400" />,
    };

    return (
        <Link href={item.href} onClick={onClick}>
            <div className="flex items-center p-3 hover:bg-gray-700 rounded-md cursor-pointer transition-colors">
                <div className="mr-3 flex-shrink-0">{iconMap[item.type]}</div>
                <div>
                    <p className="font-semibold text-white text-sm">{item.title}</p>
                    {item.subtitle && <p className="text-xs text-gray-400">{item.subtitle}</p>}
                </div>
            </div>
        </Link>
    );
};

export default function GlobalSearch() {
    const { campaigns, tasks, notes } = useAppContext();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const searchRef = useRef(null);

    const fuse = useMemo(() => {
        const allData = [
            ...campaigns.map(c => ({ ...c, type: 'campaign', title: c.name, subtitle: c.objective, href: `/campaigns/${c.id}` })),
            ...tasks.map(t => ({ ...t, type: 'task', title: t.text, subtitle: `In: ${t.campaign || 'Tasks'}`, href: `/tasks` })),
            ...notes.map(n => ({ ...n, type: 'note', title: n.title, subtitle: n.content.substring(0, 30) + '...', href: `/notes` })),
        ];

        return new Fuse(allData, {
            keys: ['title', 'subtitle', 'tags'],
            includeScore: true,
            threshold: 0.4,
        });
    }, [campaigns, tasks, notes]);

    useEffect(() => {
        if (query) {
            const searchResults = fuse.search(query).map(result => result.item);
            setResults(searchResults.slice(0, 10)); // Limit to top 10 results
        } else {
            setResults([]);
        }
    }, [query, fuse]);
    
    // Close results when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsFocused(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [searchRef]);


    const handleClose = () => {
        setQuery('');
        setIsFocused(false);
    };

    return (
        <div className="relative" ref={searchRef}>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                    type="text"
                    placeholder="Search anything..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    className="w-full bg-gray-800 border border-transparent focus:border-yellow-400 focus:ring-yellow-400 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-500 transition-colors"
                />
            </div>

            {isFocused && query && (
                <div className="absolute top-full mt-2 w-full bg-gray-800 border border-gray-700 rounded-lg shadow-2xl z-20 p-2 max-h-96 overflow-y-auto">
                    {results.length > 0 ? (
                        <div>
                            {results.map((item) => (
                                <ResultItem key={`${item.type}-${item.id}`} item={item} onClick={handleClose} />
                            ))}
                        </div>
                    ) : (
                        <div className="p-4 text-center text-gray-500">
                            No results found for &quot;{query}&quot;
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
