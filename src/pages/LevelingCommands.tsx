import React from 'react';
import { CommandCard } from '../components/CommandCard';
import { TrendingUp, Award, Target, BarChart3, Trophy, Star, Zap, Crown } from 'lucide-react';

export const LevelingCommands: React.FC = () => {
  const levelingCommands = [
    {
      name: 'level',
      description: 'Check your current level, XP, and progress to the next level.',
      usage: '/level [user]',
      example: '/level @username',
      category: 'Leveling',
      cooldown: '5 seconds',
      aliases: ['lvl', 'xp'],
      icon: <TrendingUp className="w-5 h-5 text-white" />,
      color: 'from-indigo-400 to-purple-500'
    },
    {
      name: 'leaderboard',
      description: 'View the server XP leaderboard with detailed rankings.',
      usage: '/leaderboard [page]',
      example: '/leaderboard 2',
      category: 'Leveling',
      cooldown: '10 seconds',
      aliases: ['lb', 'top'],
      icon: <Trophy className="w-5 h-5 text-white" />,
      color: 'from-yellow-400 to-orange-500'
    },
    {
      name: 'rank',
      description: 'Generate a beautiful rank card showing your progress and stats.',
      usage: '/rank [user]',
      example: '/rank @member',
      category: 'Leveling',
      cooldown: '10 seconds',
      aliases: ['rankcard'],
      icon: <Award className="w-5 h-5 text-white" />,
      color: 'from-blue-400 to-cyan-500'
    },
    {
      name: 'rewards',
      description: 'View available level rewards and role unlocks.',
      usage: '/rewards [level]',
      example: '/rewards 25',
      category: 'Leveling',
      cooldown: '5 seconds',
      aliases: ['levelrewards'],
      icon: <Star className="w-5 h-5 text-white" />,
      color: 'from-purple-400 to-pink-500'
    },
    {
      name: 'setlevel',
      description: 'Set a user\'s level (Administrator only).',
      usage: '/setlevel <user> <level>',
      example: '/setlevel @member 50',
      category: 'Leveling',
      permissions: ['Administrator'],
      cooldown: '5 seconds',
      icon: <Target className="w-5 h-5 text-white" />,
      color: 'from-red-400 to-orange-500'
    },
    {
      name: 'addxp',
      description: 'Add XP to a user (Moderator only).',
      usage: '/addxp <user> <amount>',
      example: '/addxp @member 1000',
      category: 'Leveling',
      permissions: ['Manage Messages'],
      cooldown: '3 seconds',
      icon: <Zap className="w-5 h-5 text-white" />,
      color: 'from-green-400 to-emerald-500'
    },
    {
      name: 'levelconfig',
      description: 'Configure leveling system settings and XP rates.',
      usage: '/levelconfig <setting> <value>',
      example: '/levelconfig xp_rate 1.5',
      category: 'Leveling',
      permissions: ['Administrator'],
      cooldown: '10 seconds',
      icon: <BarChart3 className="w-5 h-5 text-white" />,
      color: 'from-gray-400 to-gray-600'
    },
    {
      name: 'prestige',
      description: 'Reset your level for prestige points and exclusive rewards.',
      usage: '/prestige',
      example: '/prestige',
      category: 'Leveling',
      cooldown: '86400 seconds',
      icon: <Crown className="w-5 h-5 text-white" />,
      color: 'from-yellow-400 to-red-500'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl">
            <TrendingUp className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-bold text-white mb-2">Leveling Commands</h1>
            <p className="text-gray-400 text-lg">Comprehensive XP and leveling system with rewards</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <div className="bg-gradient-to-r from-indigo-600/20 to-purple-600/20 border border-indigo-500/30 rounded-xl px-4 py-2">
            <span className="text-indigo-400 font-medium">📈 XP Tracking</span>
          </div>
          <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl px-4 py-2">
            <span className="text-yellow-400 font-medium">🏆 Leaderboards</span>
          </div>
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl px-4 py-2">
            <span className="text-purple-400 font-medium">🎁 Level Rewards</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {levelingCommands.map((command, index) => (
          <CommandCard key={index} {...command} />
        ))}
      </div>
    </div>
  );
};