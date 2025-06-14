import React from 'react';
import { CommandCard } from '../components/CommandCard';
import { Shield, Lock, Eye, AlertTriangle, UserX, Ban, Key, Scan } from 'lucide-react';

export const SecurityCommands: React.FC = () => {
  const securityCommands = [
    {
      name: 'antispam',
      description: 'Configure advanced anti-spam protection with customizable thresholds and actions.',
      usage: '/antispam <enable|disable|config>',
      example: '/antispam enable',
      category: 'Security',
      permissions: ['Administrator'],
      cooldown: '5 seconds',
      icon: <Shield className="w-5 h-5 text-white" />,
      color: 'from-red-400 to-pink-500'
    },
    {
      name: 'automod',
      description: 'Intelligent auto-moderation system with AI-powered content filtering.',
      usage: '/automod <setup|toggle|settings>',
      example: '/automod setup',
      category: 'Security',
      permissions: ['Administrator'],
      cooldown: '3 seconds',
      icon: <Scan className="w-5 h-5 text-white" />,
      color: 'from-orange-400 to-red-500'
    },
    {
      name: 'lockdown',
      description: 'Emergency lockdown mode to restrict all channel permissions instantly.',
      usage: '/lockdown [channel] [reason]',
      example: '/lockdown #general Raid protection',
      category: 'Security',
      permissions: ['Administrator'],
      cooldown: '10 seconds',
      icon: <Lock className="w-5 h-5 text-white" />,
      color: 'from-red-500 to-rose-600'
    },
    {
      name: 'audit',
      description: 'View detailed audit logs with advanced filtering and search capabilities.',
      usage: '/audit [user] [action] [timeframe]',
      example: '/audit @user ban 7d',
      category: 'Security',
      permissions: ['View Audit Log'],
      cooldown: '5 seconds',
      icon: <Eye className="w-5 h-5 text-white" />,
      color: 'from-blue-400 to-indigo-500'
    },
    {
      name: 'raidmode',
      description: 'Activate raid protection mode with automatic member screening.',
      usage: '/raidmode <on|off> [level]',
      example: '/raidmode on high',
      category: 'Security',
      permissions: ['Administrator'],
      cooldown: '15 seconds',
      icon: <AlertTriangle className="w-5 h-5 text-white" />,
      color: 'from-yellow-400 to-orange-500'
    },
    {
      name: 'massban',
      description: 'Ban multiple users at once with optional reason and message deletion.',
      usage: '/massban <users...> [reason]',
      example: '/massban @user1 @user2 @user3 Spam accounts',
      category: 'Security',
      permissions: ['Ban Members'],
      cooldown: '30 seconds',
      icon: <Ban className="w-5 h-5 text-white" />,
      color: 'from-red-600 to-pink-600'
    },
    {
      name: 'whitelist',
      description: 'Manage server whitelist for enhanced security and member control.',
      usage: '/whitelist <add|remove|list> [user]',
      example: '/whitelist add @trusteduser',
      category: 'Security',
      permissions: ['Administrator'],
      cooldown: '3 seconds',
      icon: <UserX className="w-5 h-5 text-white" />,
      color: 'from-green-400 to-emerald-500'
    },
    {
      name: 'backup',
      description: 'Create and manage server backups including roles, channels, and settings.',
      usage: '/backup <create|restore|list>',
      example: '/backup create',
      category: 'Security',
      permissions: ['Administrator'],
      cooldown: '60 seconds',
      icon: <Key className="w-5 h-5 text-white" />,
      color: 'from-purple-400 to-violet-500'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-red-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-bold text-white mb-2">Security Commands</h1>
            <p className="text-gray-400 text-lg">Advanced security features to protect your server</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <div className="bg-gradient-to-r from-red-600/20 to-pink-600/20 border border-red-500/30 rounded-xl px-4 py-2">
            <span className="text-red-400 font-medium">🛡️ Advanced Protection</span>
          </div>
          <div className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border border-orange-500/30 rounded-xl px-4 py-2">
            <span className="text-orange-400 font-medium">🤖 AI-Powered</span>
          </div>
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl px-4 py-2">
            <span className="text-purple-400 font-medium">⚡ Real-time Monitoring</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {securityCommands.map((command, index) => (
          <CommandCard key={index} {...command} />
        ))}
      </div>
    </div>
  );
};