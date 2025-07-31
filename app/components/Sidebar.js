// app/components/Sidebar.js
"use client";
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

// CHANGE: Imports are now consolidated from the barrel file
import { 
    LayoutDashboard, 
    Target, 
    CheckSquare, 
    Notebook, 
    DollarSign, 
    BatteryIcon 
} from './icons';

const NavLink = ({ href, icon, children }) => {
    const pathname = usePathname();
    const isActive = pathname === href;

    const activeClasses = "bg-gray-800 text-white";
    const inactiveClasses = "text-gray-400 hover:bg-gray-800 hover:text-white";

    return (
        <Link href={href} className={`flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-colors ${isActive ? activeClasses : inactiveClasses}`}>
            {icon}
            {children}
        </Link>
    );
};

export default function Sidebar() {
    return (
        <aside className="w-64 flex-shrink-0 bg-gray-900 text-gray-200 flex-col hidden md:flex">
            <div className="h-16 flex items-center justify-center px-4 border-b border-gray-800">
                <BatteryIcon className="w-8 h-8 mr-2 text-yellow-400" />
                <h1 className="text-xl font-bold text-white">AdFlow Hub</h1>
            </div>
            <nav className="flex-1 px-4 py-6 space-y-2">
                <NavLink href="/" icon={<LayoutDashboard className="w-5 h-5 mr-3" />}>Dashboard</NavLink>
                <NavLink href="/campaigns" icon={<Target className="w-5 h-5 mr-3" />}>Campaigns</NavLink>
                <NavLink href="/tasks" icon={<CheckSquare className="w-5 h-5 mr-3" />}>Tasks</NavLink>
                <NavLink href="/notes" icon={<Notebook className="w-5 h-5 mr-3" />}>Notes</NavLink>
                <NavLink href="/budgets" icon={<DollarSign className="w-5 h-5 mr-3" />}>Budgets</NavLink>
            </nav>
            <div className="px-4 py-6 mt-auto border-t border-gray-800">
                <div className="flex items-center">
                    <Image 
                        className="rounded-full object-cover" 
                        src="https://placehold.co/100x100/eab308/FFFFFF?text=F" 
                        alt="User avatar for Felix" 
                        width={40} 
                        height={40} 
                        aria-label="User Felix, Marketing Lead"
                    />
                     <div className="ml-3">
                        <p className="text-sm font-semibold text-white">Felix</p>
                        <p className="text-xs text-gray-400">Marketing Lead</p>
                    </div>
                 </div>
            </div>
        </aside>
    );
}