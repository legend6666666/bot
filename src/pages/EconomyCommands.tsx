import React from 'react';
import { CommandCard } from '../components/CommandCard';
import { DollarSign, Coins, TrendingUp, Gift, ShoppingCart, Wallet, CreditCard, PiggyBank } from 'lucide-react';

export const EconomyCommands: React.FC = () => {
  const economyCommands = [
    {
      name: 'balance',
      description: 'Check your current balance including coins, bank savings, and total net worth.',
      usage: '/balance [user]',
      example: '/balance @username',
      category: 'Economy',
      cooldown: '3 seconds',
      aliases: ['bal', 'money'],
      icon: <Wallet className="w-5 h-5 text-white" />,
      color: 'from-yellow-400 to-orange-500'
    },
    {
      name: 'daily',
      description: 'Claim your daily reward with streak bonuses and premium multipliers.',
      usage: '/daily',
      example: '/daily',
      category: 'Economy',
      cooldown: '24 hours',
      icon: <Gift className="w-5 h-5 text-white" />,
      color: 'from-green-400 to-emerald-500'
    },
    {
      name: 'work',
      description: 'Work various jobs to earn coins with different pay rates and requirements.',
      usage: '/work [job]',
      example: '/work programmer',
      category: 'Economy',
      cooldown: '1 hour',
      aliases: ['job'],
      icon: <TrendingUp className="w-5 h-5 text-white" />,
      color: 'from-blue-400 to-cyan-500'
    },
    {
      name: 'shop',
      description: 'Browse and purchase items from the server shop with various categories.',
      usage: '/shop [category]',
      example: '/shop roles',
      category: 'Economy',
      cooldown: '2 seconds',
      aliases: ['store'],
      icon: <ShoppingCart className="w-5 h-5 text-white" />,
      color: 'from-purple-400 to-pink-500'
    },
    {
      name: 'pay',
      description: 'Transfer coins to another user with transaction fees and limits.',
      usage: '/pay <user> <amount>',
      example: '/pay @friend 1000',
      category: 'Economy',
      cooldown: '5 seconds',
      aliases: ['transfer', 'give'],
      icon: <CreditCard className="w-5 h-5 text-white" />,
      color: 'from-indigo-400 to-purple-500'
    },
    {
      name: 'bank',
      description: 'Manage your bank account with deposits, withdrawals, and interest.',
      usage: '/bank <deposit|withdraw> <amount>',
      example: '/bank deposit 5000',
      category: 'Economy',
      cooldown: '3 seconds',
      icon: <PiggyBank className="w-5 h-5 text-white" />,
      color: 'from-emerald-400 to-green-500'
    },
    {
      name: 'gamble',
      description: 'Try your luck with various gambling games and win big rewards.',
      usage: '/gamble <game> <amount>',
      example: '/gamble slots 500',
      category: 'Economy',
      cooldown: '10 seconds',
      aliases: ['bet'],
      icon: <Coins className="w-5 h-5 text-white" />,
      color: 'from-red-400 to-orange-500'
    },
    {
      name: 'leaderboard',
      description: 'View the richest users on the server with detailed rankings.',
      usage: '/leaderboard [type]',
      example: '/leaderboard coins',
      category: 'Economy',
      cooldown: '5 seconds',
      aliases: ['lb', 'top'],
      icon: <TrendingUp className="w-5 h-5 text-white" />,
      color: 'from-yellow-400 to-red-500'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-2xl">
            <DollarSign className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-bold text-white mb-2">Economy Commands</h1>
            <p className="text-gray-400 text-lg">Complete virtual economy system with jobs, shops, and more</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl px-4 py-2">
            <span className="text-yellow-400 font-medium">💰 Virtual Currency</span>
          </div>
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl px-4 py-2">
            <span className="text-green-400 font-medium">🏪 Custom Shops</span>
          </div>
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl px-4 py-2">
            <span className="text-blue-400 font-medium">📈 Investment System</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {economyCommands.map((command, index) => (
          <CommandCard key={index} {...command} />
        ))}
      </div>
    </div>
  );
};