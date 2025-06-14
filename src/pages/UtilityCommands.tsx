import React from 'react';
import { CommandCard } from '../components/CommandCard';
import { Settings, Info, Calendar, Clock, Calculator, QrCode, Link, Zap } from 'lucide-react';

export const UtilityCommands: React.FC = () => {
  const utilityCommands = [
    {
      name: 'serverinfo',
      description: 'Display detailed information about the current server including stats and settings.',
      usage: '/serverinfo',
      example: '/serverinfo',
      category: 'Utility',
      cooldown: '5 seconds',
      aliases: ['si'],
      icon: <Info className="w-5 h-5 text-white" />,
      color: 'from-blue-400 to-cyan-500'
    },
    {
      name: 'userinfo',
      description: 'Show comprehensive user information including roles, join date, and activity.',
      usage: '/userinfo [user]',
      example: '/userinfo @username',
      category: 'Utility',
      cooldown: '3 seconds',
      aliases: ['ui', 'whois'],
      icon: <Info className="w-5 h-5 text-white" />,
      color: 'from-green-400 to-blue-500'
    },
    {
      name: 'remind',
      description: 'Set personal reminders with custom messages and flexible time formats.',
      usage: '/remind <time> <message>',
      example: '/remind 2h Take a break',
      category: 'Utility',
      cooldown: '2 seconds',
      aliases: ['reminder'],
      icon: <Clock className="w-5 h-5 text-white" />,
      color: 'from-purple-400 to-pink-500'
    },
    {
      name: 'poll',
      description: 'Create interactive polls with multiple options and automatic vote counting.',
      usage: '/poll <question> <option1> <option2> [more options]',
      example: '/poll "Favorite color?" Red Blue Green',
      category: 'Utility',
      cooldown: '10 seconds',
      icon: <Calendar className="w-5 h-5 text-white" />,
      color: 'from-yellow-400 to-orange-500'
    },
    {
      name: 'calculate',
      description: 'Perform mathematical calculations with support for complex expressions.',
      usage: '/calculate <expression>',
      example: '/calculate 2 + 2 * 3',
      category: 'Utility',
      cooldown: '1 second',
      aliases: ['calc', 'math'],
      icon: <Calculator className="w-5 h-5 text-white" />,
      color: 'from-indigo-400 to-purple-500'
    },
    {
      name: 'qr',
      description: 'Generate QR codes for text, URLs, or other data with customizable size.',
      usage: '/qr <text> [size]',
      example: '/qr https://discord.com large',
      category: 'Utility',
      cooldown: '3 seconds',
      aliases: ['qrcode'],
      icon: <QrCode className="w-5 h-5 text-white" />,
      color: 'from-cyan-400 to-blue-500'
    },
    {
      name: 'shorten',
      description: 'Create shortened URLs with click tracking and custom aliases.',
      usage: '/shorten <url> [alias]',
      example: '/shorten https://example.com/very/long/url mylink',
      category: 'Utility',
      cooldown: '5 seconds',
      aliases: ['short'],
      icon: <Link className="w-5 h-5 text-white" />,
      color: 'from-emerald-400 to-green-500'
    },
    {
      name: 'translate',
      description: 'Translate text between languages with auto-detection support.',
      usage: '/translate <text> [from] <to>',
      example: '/translate "Hello world" en es',
      category: 'Utility',
      cooldown: '3 seconds',
      aliases: ['tr'],
      icon: <Zap className="w-5 h-5 text-white" />,
      color: 'from-rose-400 to-pink-500'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-600 rounded-2xl flex items-center justify-center shadow-2xl">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-bold text-white mb-2">Utility Commands</h1>
            <p className="text-gray-400 text-lg">Essential tools and utilities for everyday use</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl px-4 py-2">
            <span className="text-blue-400 font-medium">🔧 Essential Tools</span>
          </div>
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl px-4 py-2">
            <span className="text-green-400 font-medium">⚡ Fast & Reliable</span>
          </div>
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl px-4 py-2">
            <span className="text-purple-400 font-medium">🎯 User Friendly</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {utilityCommands.map((command, index) => (
          <CommandCard key={index} {...command} />
        ))}
      </div>
    </div>
  );
};