import React from 'react';
import { Menu, Bell, Search, User, Settings } from 'lucide-react';

interface HeaderProps {
  onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  return (
    <header className="bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            <Menu size={24} />
          </button>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search commands..."
              className="bg-gray-800/50 border border-gray-700/50 rounded-xl pl-10 pr-4 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500/50 focus:bg-gray-800/80 transition-all duration-200 w-80"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
            <Bell size={20} />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          </button>
          
          <button className="p-2 text-gray-400 hover:text-white transition-colors">
            <Settings size={20} />
          </button>
          
          <div className="flex items-center gap-3 pl-4 border-l border-gray-700/50">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-white text-sm font-medium">Admin User</p>
              <p className="text-gray-400 text-xs">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};