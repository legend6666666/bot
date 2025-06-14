import React from 'react';
import { 
  Music, Shield, DollarSign, Gavel, Settings, Users, 
  Gamepad2, Smile, Heart, TrendingUp, Bot, Ticket,
  Activity, Server, Clock, Zap
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const stats = [
    { label: 'Total Commands', value: '150+', icon: Zap, color: 'from-blue-500 to-cyan-500' },
    { label: 'Active Servers', value: '1,234', icon: Server, color: 'from-green-500 to-emerald-500' },
    { label: 'Commands Used Today', value: '45.2K', icon: Activity, color: 'from-purple-500 to-pink-500' },
    { label: 'Uptime', value: '99.9%', icon: Clock, color: 'from-orange-500 to-red-500' },
  ];

  const categories = [
    { name: 'Music', icon: Music, count: 15, color: 'from-green-400 to-blue-500', description: 'Play, queue, and control music' },
    { name: 'Security', icon: Shield, count: 12, color: 'from-red-400 to-pink-500', description: 'Advanced security features' },
    { name: 'Economy', icon: DollarSign, count: 18, color: 'from-yellow-400 to-orange-500', description: 'Virtual economy system' },
    { name: 'Moderation', icon: Gavel, count: 20, color: 'from-orange-400 to-red-500', description: 'Server moderation tools' },
    { name: 'Utility', icon: Settings, count: 25, color: 'from-gray-400 to-gray-600', description: 'Helpful utility commands' },
    { name: 'Social', icon: Users, count: 14, color: 'from-pink-400 to-rose-500', description: 'Social interaction features' },
    { name: 'Games', icon: Gamepad2, count: 16, color: 'from-purple-400 to-indigo-500', description: 'Fun games and activities' },
    { name: 'Memes', icon: Smile, count: 10, color: 'from-cyan-400 to-blue-500', description: 'Meme generation and fun' },
    { name: 'Anime', icon: Heart, count: 8, color: 'from-rose-400 to-pink-500', description: 'Anime-related commands' },
    { name: 'Leveling', icon: TrendingUp, count: 12, color: 'from-indigo-400 to-purple-500', description: 'XP and leveling system' },
    { name: 'AI Commands', icon: Bot, count: 22, color: 'from-violet-400 to-purple-500', description: 'AI-powered features' },
    { name: 'Tickets', icon: Ticket, count: 6, color: 'from-emerald-400 to-green-500', description: 'Support ticket system' },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12">
        <div className="inline-flex items-center gap-3 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-2xl">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-bold text-white mb-2">Discord Bot Dashboard</h1>
            <p className="text-gray-400 text-lg">Complete bot management with 150+ premium commands</p>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-xl px-6 py-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 font-medium">Bot Online</span>
            </div>
          </div>
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl px-6 py-3">
            <span className="text-blue-400 font-medium">Premium Features Enabled</span>
          </div>
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl px-6 py-3">
            <span className="text-purple-400 font-medium">24/7 Support</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:bg-gray-800/70 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-lg`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-gray-400 text-sm">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Categories Grid */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">Command Categories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((category, index) => (
            <div key={index} className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:bg-gray-800/70 transition-all duration-300 hover:scale-105 cursor-pointer group">
              <div className="flex items-center gap-4 mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${category.color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <category.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg">{category.name}</h3>
                  <p className="text-gray-400 text-sm">{category.count} commands</p>
                </div>
              </div>
              <p className="text-gray-300 text-sm leading-relaxed">{category.description}</p>
              
              <div className="mt-4 pt-4 border-t border-gray-700/50">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-xs">Click to explore</span>
                  <div className="w-2 h-2 bg-blue-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { action: 'Music command used', server: 'Gaming Server', time: '2 minutes ago', type: 'music' },
            { action: 'User banned', server: 'Community Hub', time: '5 minutes ago', type: 'moderation' },
            { action: 'Economy transaction', server: 'Trading Post', time: '8 minutes ago', type: 'economy' },
            { action: 'Ticket created', server: 'Support Server', time: '12 minutes ago', type: 'ticket' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-4 p-4 bg-gray-900/30 rounded-xl">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'music' ? 'bg-green-400' :
                activity.type === 'moderation' ? 'bg-red-400' :
                activity.type === 'economy' ? 'bg-yellow-400' :
                'bg-blue-400'
              } animate-pulse`} />
              <div className="flex-1">
                <p className="text-white font-medium">{activity.action}</p>
                <p className="text-gray-400 text-sm">{activity.server}</p>
              </div>
              <span className="text-gray-400 text-sm">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};