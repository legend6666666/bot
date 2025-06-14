import React from 'react';
import { CommandCard } from '../components/CommandCard';
import { Music, Play, Pause, SkipForward, SkipBack, Volume2, Shuffle, Repeat, List, Search } from 'lucide-react';

export const MusicCommands: React.FC = () => {
  const musicCommands = [
    {
      name: 'play',
      description: 'Play music from YouTube, Spotify, or SoundCloud. Supports playlists and direct links.',
      usage: '/play <song name or URL>',
      example: '/play Never Gonna Give You Up',
      category: 'Music',
      cooldown: '2 seconds',
      aliases: ['p'],
      icon: <Play className="w-5 h-5 text-white" />,
      color: 'from-green-400 to-blue-500'
    },
    {
      name: 'pause',
      description: 'Pause the currently playing music. Use resume to continue playback.',
      usage: '/pause',
      example: '/pause',
      category: 'Music',
      cooldown: '1 second',
      icon: <Pause className="w-5 h-5 text-white" />,
      color: 'from-orange-400 to-red-500'
    },
    {
      name: 'skip',
      description: 'Skip the current song and play the next one in the queue.',
      usage: '/skip [amount]',
      example: '/skip 2',
      category: 'Music',
      cooldown: '1 second',
      aliases: ['s', 'next'],
      icon: <SkipForward className="w-5 h-5 text-white" />,
      color: 'from-blue-400 to-purple-500'
    },
    {
      name: 'previous',
      description: 'Go back to the previous song in the queue history.',
      usage: '/previous',
      example: '/previous',
      category: 'Music',
      cooldown: '1 second',
      aliases: ['prev', 'back'],
      icon: <SkipBack className="w-5 h-5 text-white" />,
      color: 'from-purple-400 to-pink-500'
    },
    {
      name: 'volume',
      description: 'Adjust the music volume from 0 to 100. Default is 50.',
      usage: '/volume <0-100>',
      example: '/volume 75',
      category: 'Music',
      cooldown: '1 second',
      aliases: ['vol'],
      permissions: ['Manage Messages'],
      icon: <Volume2 className="w-5 h-5 text-white" />,
      color: 'from-cyan-400 to-blue-500'
    },
    {
      name: 'queue',
      description: 'Display the current music queue with song information and duration.',
      usage: '/queue [page]',
      example: '/queue 2',
      category: 'Music',
      cooldown: '3 seconds',
      aliases: ['q', 'list'],
      icon: <List className="w-5 h-5 text-white" />,
      color: 'from-indigo-400 to-purple-500'
    },
    {
      name: 'shuffle',
      description: 'Shuffle the current queue to randomize song order.',
      usage: '/shuffle',
      example: '/shuffle',
      category: 'Music',
      cooldown: '2 seconds',
      permissions: ['Manage Messages'],
      icon: <Shuffle className="w-5 h-5 text-white" />,
      color: 'from-pink-400 to-rose-500'
    },
    {
      name: 'loop',
      description: 'Toggle loop mode for current song, queue, or disable looping.',
      usage: '/loop <song|queue|off>',
      example: '/loop queue',
      category: 'Music',
      cooldown: '1 second',
      aliases: ['repeat'],
      icon: <Repeat className="w-5 h-5 text-white" />,
      color: 'from-emerald-400 to-green-500'
    },
    {
      name: 'search',
      description: 'Search for songs and select from results to add to queue.',
      usage: '/search <query>',
      example: '/search rock music 2023',
      category: 'Music',
      cooldown: '3 seconds',
      icon: <Search className="w-5 h-5 text-white" />,
      color: 'from-yellow-400 to-orange-500'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl">
            <Music className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-bold text-white mb-2">Music Commands</h1>
            <p className="text-gray-400 text-lg">High-quality music streaming with advanced controls</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <div className="bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-xl px-4 py-2">
            <span className="text-green-400 font-medium">🎵 Multi-Platform Support</span>
          </div>
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl px-4 py-2">
            <span className="text-blue-400 font-medium">🎧 High Quality Audio</span>
          </div>
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl px-4 py-2">
            <span className="text-purple-400 font-medium">📱 Mobile Friendly</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {musicCommands.map((command, index) => (
          <CommandCard key={index} {...command} />
        ))}
      </div>
    </div>
  );
};