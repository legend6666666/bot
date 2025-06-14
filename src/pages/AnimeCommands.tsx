import React from 'react';
import { CommandCard } from '../components/CommandCard';
import { Heart, Search, Star, Image, Shuffle, Sparkles, Eye, Zap } from 'lucide-react';

export const AnimeCommands: React.FC = () => {
  const animeCommands = [
    {
      name: 'anime',
      description: 'Search for anime information including ratings, synopsis, and episodes.',
      usage: '/anime <name>',
      example: '/anime Attack on Titan',
      category: 'Anime',
      cooldown: '5 seconds',
      icon: <Search className="w-5 h-5 text-white" />,
      color: 'from-rose-400 to-pink-500'
    },
    {
      name: 'manga',
      description: 'Get detailed information about manga series and chapters.',
      usage: '/manga <name>',
      example: '/manga One Piece',
      category: 'Anime',
      cooldown: '5 seconds',
      icon: <Eye className="w-5 h-5 text-white" />,
      color: 'from-purple-400 to-pink-500'
    },
    {
      name: 'waifu',
      description: 'Get random waifu images from various anime series.',
      usage: '/waifu [character]',
      example: '/waifu Zero Two',
      category: 'Anime',
      cooldown: '3 seconds',
      icon: <Heart className="w-5 h-5 text-white" />,
      color: 'from-pink-400 to-rose-500'
    },
    {
      name: 'quote',
      description: 'Get inspirational or funny quotes from anime characters.',
      usage: '/quote [character]',
      example: '/quote Naruto',
      category: 'Anime',
      cooldown: '5 seconds',
      aliases: ['animequote'],
      icon: <Sparkles className="w-5 h-5 text-white" />,
      color: 'from-yellow-400 to-orange-500'
    },
    {
      name: 'character',
      description: 'Search for detailed anime character information and stats.',
      usage: '/character <name>',
      example: '/character Goku',
      category: 'Anime',
      cooldown: '5 seconds',
      aliases: ['char'],
      icon: <Star className="w-5 h-5 text-white" />,
      color: 'from-blue-400 to-purple-500'
    },
    {
      name: 'random',
      description: 'Get random anime recommendations based on genres and ratings.',
      usage: '/random [genre]',
      example: '/random action',
      category: 'Anime',
      cooldown: '10 seconds',
      aliases: ['randomanime'],
      icon: <Shuffle className="w-5 h-5 text-white" />,
      color: 'from-indigo-400 to-purple-500'
    },
    {
      name: 'gif',
      description: 'Get anime GIFs for various emotions and reactions.',
      usage: '/gif <emotion>',
      example: '/gif happy',
      category: 'Anime',
      cooldown: '3 seconds',
      aliases: ['animegif'],
      icon: <Image className="w-5 h-5 text-white" />,
      color: 'from-cyan-400 to-blue-500'
    },
    {
      name: 'schedule',
      description: 'View anime airing schedule for current and upcoming seasons.',
      usage: '/schedule [day]',
      example: '/schedule monday',
      category: 'Anime',
      cooldown: '10 seconds',
      icon: <Zap className="w-5 h-5 text-white" />,
      color: 'from-green-400 to-emerald-500'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-rose-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-bold text-white mb-2">Anime Commands</h1>
            <p className="text-gray-400 text-lg">Explore the world of anime with comprehensive features</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <div className="bg-gradient-to-r from-rose-600/20 to-pink-600/20 border border-rose-500/30 rounded-xl px-4 py-2">
            <span className="text-rose-400 font-medium">🌸 Anime Database</span>
          </div>
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl px-4 py-2">
            <span className="text-purple-400 font-medium">📚 Manga Info</span>
          </div>
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl px-4 py-2">
            <span className="text-blue-400 font-medium">✨ Character Profiles</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {animeCommands.map((command, index) => (
          <CommandCard key={index} {...command} />
        ))}
      </div>
    </div>
  );
};