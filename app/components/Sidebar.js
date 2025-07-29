"use client";

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

// --- ICONS --- //
const LayoutDashboard = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7"height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg>;
const Target = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>;
const CheckSquare = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>;
const Notebook = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 6h4"></path><path d="M2 10h4"></path><path d="M2 14h4"></path><path d="M2 18h4"></path><rect width="16" height="20" x="4" y="2" rx="2"></rect><path d="M16 2v20"></path></svg>;
const DollarSign = ({ className }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>;
const BatteryIcon = ({ className }) => <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16,2H8A4,4,0,0,0,4,6V18a4,4,0,0,0,4,4h8a4,4,0,0,0,4-4V6A4,4,0,0,0,16,2Zm-4,3a1,1,0,0,1,1,1V8a1,1,0,0,1-2,0V6A1,1,0,0,1,12,5Zm-2,9H8a1,1,0,0,1,0-2h2a1,1,0,0,1,0,2Zm4,0H14a1,1,0,0,1,0-2h2a1,1,0,0,1,0,2Z" /></svg>;


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
                    <Image className="rounded-full object-cover" src="https://placehold.co/100x100/eab308/FFFFFF?text=F" alt="User avatar" width={40} height={40} />
                    <div className="ml-3">
                        <p className="text-sm font-semibold text-white">Felix</p>
                        <p className="text-xs text-gray-400">Marketing Lead</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
