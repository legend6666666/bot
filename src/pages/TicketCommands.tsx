import React from 'react';
import { CommandCard } from '../components/CommandCard';
import { Ticket, Plus, X, Archive, Clock, User, MessageSquare, Settings } from 'lucide-react';

export const TicketCommands: React.FC = () => {
  const ticketCommands = [
    {
      name: 'ticket',
      description: 'Create a new support ticket with automatic channel creation.',
      usage: '/ticket <reason>',
      example: '/ticket Need help with bot setup',
      category: 'Tickets',
      cooldown: '60 seconds',
      aliases: ['new', 'create'],
      icon: <Plus className="w-5 h-5 text-white" />,
      color: 'from-emerald-400 to-green-500'
    },
    {
      name: 'close',
      description: 'Close the current ticket with optional reason and transcript.',
      usage: '/close [reason]',
      example: '/close Issue resolved',
      category: 'Tickets',
      permissions: ['Manage Messages'],
      cooldown: '5 seconds',
      icon: <X className="w-5 h-5 text-white" />,
      color: 'from-red-400 to-orange-500'
    },
    {
      name: 'add',
      description: 'Add a user to the current ticket for collaboration.',
      usage: '/add <user>',
      example: '/add @helper',
      category: 'Tickets',
      permissions: ['Manage Messages'],
      cooldown: '3 seconds',
      icon: <User className="w-5 h-5 text-white" />,
      color: 'from-blue-400 to-cyan-500'
    },
    {
      name: 'remove',
      description: 'Remove a user from the current ticket.',
      usage: '/remove <user>',
      example: '/remove @user',
      category: 'Tickets',
      permissions: ['Manage Messages'],
      cooldown: '3 seconds',
      icon: <X className="w-5 h-5 text-white" />,
      color: 'from-orange-400 to-red-500'
    },
    {
      name: 'transcript',
      description: 'Generate a full transcript of the ticket conversation.',
      usage: '/transcript',
      example: '/transcript',
      category: 'Tickets',
      permissions: ['Manage Messages'],
      cooldown: '30 seconds',
      icon: <Archive className="w-5 h-5 text-white" />,
      color: 'from-purple-400 to-pink-500'
    },
    {
      name: 'ticketsetup',
      description: 'Configure ticket system settings and categories.',
      usage: '/ticketsetup <category|role|channel>',
      example: '/ticketsetup category Support',
      category: 'Tickets',
      permissions: ['Administrator'],
      cooldown: '10 seconds',
      icon: <Settings className="w-5 h-5 text-white" />,
      color: 'from-gray-400 to-gray-600'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center shadow-2xl">
            <Ticket className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-bold text-white mb-2">Ticket Commands</h1>
            <p className="text-gray-400 text-lg">Professional support ticket system for your server</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <div className="bg-gradient-to-r from-emerald-600/20 to-green-600/20 border border-emerald-500/30 rounded-xl px-4 py-2">
            <span className="text-emerald-400 font-medium">🎫 Auto Channels</span>
          </div>
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl px-4 py-2">
            <span className="text-blue-400 font-medium">📝 Transcripts</span>
          </div>
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl px-4 py-2">
            <span className="text-purple-400 font-medium">⚙️ Customizable</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {ticketCommands.map((command, index) => (
          <CommandCard key={index} {...command} />
        ))}
      </div>
    </div>
  );
};