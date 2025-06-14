import React from 'react';
import { CommandCard } from '../components/CommandCard';
import { Gavel, Ban, UserX, MessageSquareX, Clock, AlertTriangle, Eye, Trash2 } from 'lucide-react';

export const ModerationCommands: React.FC = () => {
  const moderationCommands = [
    {
      name: 'ban',
      description: 'Ban a user from the server with optional reason and message deletion.',
      usage: '/ban <user> [reason] [delete_days]',
      example: '/ban @spammer Repeated spam violations 7',
      category: 'Moderation',
      permissions: ['Ban Members'],
      cooldown: '2 seconds',
      icon: <Ban className="w-5 h-5 text-white" />,
      color: 'from-red-400 to-pink-500'
    },
    {
      name: 'kick',
      description: 'Remove a user from the server with an optional reason.',
      usage: '/kick <user> [reason]',
      example: '/kick @troublemaker Breaking server rules',
      category: 'Moderation',
      permissions: ['Kick Members'],
      cooldown: '2 seconds',
      icon: <UserX className="w-5 h-5 text-white" />,
      color: 'from-orange-400 to-red-500'
    },
    {
      name: 'timeout',
      description: 'Temporarily mute a user for a specified duration.',
      usage: '/timeout <user> <duration> [reason]',
      example: '/timeout @user 1h Inappropriate behavior',
      category: 'Moderation',
      permissions: ['Moderate Members'],
      cooldown: '1 second',
      aliases: ['mute'],
      icon: <Clock className="w-5 h-5 text-white" />,
      color: 'from-yellow-400 to-orange-500'
    },
    {
      name: 'warn',
      description: 'Issue a warning to a user with automatic escalation system.',
      usage: '/warn <user> <reason>',
      example: '/warn @user Please follow the channel rules',
      category: 'Moderation',
      permissions: ['Manage Messages'],
      cooldown: '1 second',
      icon: <AlertTriangle className="w-5 h-5 text-white" />,
      color: 'from-yellow-400 to-red-500'
    },
    {
      name: 'purge',
      description: 'Bulk delete messages with advanced filtering options.',
      usage: '/purge <amount> [user] [contains]',
      example: '/purge 50 @user spam',
      category: 'Moderation',
      permissions: ['Manage Messages'],
      cooldown: '5 seconds',
      aliases: ['clear', 'clean'],
      icon: <Trash2 className="w-5 h-5 text-white" />,
      color: 'from-red-400 to-rose-500'
    },
    {
      name: 'slowmode',
      description: 'Set channel slowmode to limit message frequency.',
      usage: '/slowmode <seconds> [channel]',
      example: '/slowmode 30 #general',
      category: 'Moderation',
      permissions: ['Manage Channels'],
      cooldown: '2 seconds',
      icon: <MessageSquareX className="w-5 h-5 text-white" />,
      color: 'from-blue-400 to-indigo-500'
    },
    {
      name: 'modlogs',
      description: 'View moderation history for a user or server.',
      usage: '/modlogs [user] [type]',
      example: '/modlogs @user ban',
      category: 'Moderation',
      permissions: ['View Audit Log'],
      cooldown: '3 seconds',
      aliases: ['logs'],
      icon: <Eye className="w-5 h-5 text-white" />,
      color: 'from-purple-400 to-pink-500'
    },
    {
      name: 'case',
      description: 'View or edit specific moderation case details.',
      usage: '/case <case_id> [edit] [reason]',
      example: '/case 123 edit Updated reason',
      category: 'Moderation',
      permissions: ['Manage Messages'],
      cooldown: '2 seconds',
      icon: <Gavel className="w-5 h-5 text-white" />,
      color: 'from-indigo-400 to-purple-500'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-orange-400 to-red-500 rounded-2xl flex items-center justify-center shadow-2xl">
            <Gavel className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-bold text-white mb-2">Moderation Commands</h1>
            <p className="text-gray-400 text-lg">Comprehensive moderation tools for server management</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <div className="bg-gradient-to-r from-red-600/20 to-orange-600/20 border border-red-500/30 rounded-xl px-4 py-2">
            <span className="text-red-400 font-medium">⚖️ Fair Moderation</span>
          </div>
          <div className="bg-gradient-to-r from-orange-600/20 to-yellow-600/20 border border-orange-500/30 rounded-xl px-4 py-2">
            <span className="text-orange-400 font-medium">📋 Detailed Logs</span>
          </div>
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl px-4 py-2">
            <span className="text-purple-400 font-medium">🔄 Auto Escalation</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {moderationCommands.map((command, index) => (
          <CommandCard key={index} {...command} />
        ))}
      </div>
    </div>
  );
};