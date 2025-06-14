import React from 'react';
import { CommandCard } from '../components/CommandCard';
import { Users, Heart, MessageCircle, UserPlus, Gift, Star, Coffee, Handshake } from 'lucide-react';

export const SocialCommands: React.FC = () => {
  const socialCommands = [
    {
      name: 'hug',
      description: 'Give someone a warm virtual hug with cute animated GIFs.',
      usage: '/hug <user>',
      example: '/hug @friend',
      category: 'Social',
      cooldown: '3 seconds',
      icon: <Heart className="w-5 h-5 text-white" />,
      color: 'from-pink-400 to-rose-500'
    },
    {
      name: 'marry',
      description: 'Propose marriage to another user and start your virtual relationship.',
      usage: '/marry <user>',
      example: '/marry @soulmate',
      category: 'Social',
      cooldown: '10 seconds',
      icon: <Heart className="w-5 h-5 text-white" />,
      color: 'from-red-400 to-pink-500'
    },
    {
      name: 'profile',
      description: 'View or customize your social profile with bio, badges, and stats.',
      usage: '/profile [user]',
      example: '/profile @username',
      category: 'Social',
      cooldown: '5 seconds',
      aliases: ['p'],
      icon: <Users className="w-5 h-5 text-white" />,
      color: 'from-blue-400 to-purple-500'
    },
    {
      name: 'rep',
      description: 'Give reputation points to users who have been helpful or kind.',
      usage: '/rep <user> [reason]',
      example: '/rep @helper Thanks for the help!',
      category: 'Social',
      cooldown: '24 hours',
      aliases: ['reputation'],
      icon: <Star className="w-5 h-5 text-white" />,
      color: 'from-yellow-400 to-orange-500'
    },
    {
      name: 'ship',
      description: 'Calculate compatibility between two users with fun relationship analysis.',
      usage: '/ship <user1> <user2>',
      example: '/ship @alice @bob',
      category: 'Social',
      cooldown: '5 seconds',
      icon: <Handshake className="w-5 h-5 text-white" />,
      color: 'from-purple-400 to-pink-500'
    },
    {
      name: 'gift',
      description: 'Send virtual gifts to other users to show appreciation.',
      usage: '/gift <user> <item>',
      example: '/gift @friend flowers',
      category: 'Social',
      cooldown: '30 seconds',
      icon: <Gift className="w-5 h-5 text-white" />,
      color: 'from-green-400 to-emerald-500'
    },
    {
      name: 'coffee',
      description: 'Buy someone a virtual coffee and brighten their day.',
      usage: '/coffee <user> [message]',
      example: '/coffee @colleague Good morning!',
      category: 'Social',
      cooldown: '10 seconds',
      icon: <Coffee className="w-5 h-5 text-white" />,
      color: 'from-orange-400 to-yellow-500'
    },
    {
      name: 'compliment',
      description: 'Send a random compliment to make someone feel special.',
      usage: '/compliment <user>',
      example: '/compliment @friend',
      category: 'Social',
      cooldown: '5 seconds',
      icon: <MessageCircle className="w-5 h-5 text-white" />,
      color: 'from-cyan-400 to-blue-500'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-2xl">
            <Users className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-bold text-white mb-2">Social Commands</h1>
            <p className="text-gray-400 text-lg">Build connections and interact with your community</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <div className="bg-gradient-to-r from-pink-600/20 to-rose-600/20 border border-pink-500/30 rounded-xl px-4 py-2">
            <span className="text-pink-400 font-medium">💕 Community Building</span>
          </div>
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl px-4 py-2">
            <span className="text-purple-400 font-medium">🎭 Fun Interactions</span>
          </div>
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl px-4 py-2">
            <span className="text-blue-400 font-medium">⭐ Reputation System</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {socialCommands.map((command, index) => (
          <CommandCard key={index} {...command} />
        ))}
      </div>
    </div>
  );
};