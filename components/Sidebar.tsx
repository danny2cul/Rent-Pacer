import React from 'react';
import { Home, Wallet, CalendarClock, MessageSquareText } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: Home },
    { id: 'wallet', label: 'Wallet & History', icon: Wallet },
    { id: 'scheduler', label: 'Auto-Pay Config', icon: CalendarClock },
    { id: 'assistant', label: 'AI Assistant', icon: MessageSquareText },
  ];

  return (
    <div className="bg-white h-full border-r border-gray-200 flex flex-col">
        <div className="p-6">
            <h1 className="text-2xl font-bold text-indigo-900 flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">R</div>
                RentPacer
            </h1>
            <p className="text-xs text-gray-400 mt-1 ml-1">Escrow Simulator</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
            {navItems.map((item) => (
                <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                        activeTab === item.id
                        ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                    <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                    {item.label}
                </button>
            ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
            <div className="bg-gray-50 p-3 rounded-xl">
                <p className="text-xs text-gray-500">
                    Next release: <span className="font-semibold text-gray-700">Friday</span>
                </p>
            </div>
        </div>
    </div>
  );
};

export default Sidebar;