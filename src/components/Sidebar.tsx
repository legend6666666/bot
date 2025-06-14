import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Music, Shield, DollarSign, Gavel, Settings, Users, 
  Gamepad2, Smile, Heart, TrendingUp, Bot, Ticket, X 
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const menuItems = [
    { path: '/', icon: Home, label: 'Dashboard', color: 'text-blue-400' },
    { path: '/music', icon: Music, label: 'Music', color: 'text-green-400' },
    { path: '/security', icon: Shield, label: 'Security', color: 'text-red-400' },
    { path: '/economy', icon: DollarSign, label: 'Economy', color: 'text-yellow-400' },
    { path: '/moderation', icon: Gavel, label: 'Moderation', color: 'text-orange-400' },
    { path: '/utility', icon: Settings, label: 'Utility', color: 'text-gray-400' },
    { path: '/social', icon: Users, label: 'Social', color: 'text-pink-400' },
    { path: '/games', icon: Gamepad2, label: 'Games', color: 'text-purple-400' },
    { path: '/memes', icon: Smile, label: 'Memes', color: 'text-cyan-400' },
    { path: '/anime', icon: Heart, label: 'Anime', color: 'text-rose-400' },
    { path: '/leveling', icon: TrendingUp, label: 'Leveling', color: 'text-indigo-400' },
    { path: '/ai', icon: Bot, label: 'AI Commands', color: 'text-violet-400' },
    { path: '/tickets', icon: Ticket, label: 'Tickets', color: 'text-emerald-400' },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900/95 backdrop-blur-xl border-r border-gray-700/50
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-white font-bold text-lg">DiscordBot</h1>
                <p className="text-gray-400 text-xs">Pro Dashboard</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 text-white shadow-lg' 
                      : 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                    }
                  `}
                >
                  <item.icon className={`w-5 h-5 ${isActive ? 'text-blue-400' : item.color}`} />
                  <span className="font-medium">{item.label}</span>
                  {isActive && (
                    <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-gray-700/50">
            <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 text-sm font-medium">Bot Online</span>
              </div>
              <p className="text-gray-300 text-xs">
                Serving 1,234 servers with 99.9% uptime
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};