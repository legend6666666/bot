import React from 'react';
import { CommandCard } from '../components/CommandCard';
import { Smile, Image, Shuffle, Sparkles, Camera, Laugh, Zap, Star } from 'lucide-react';

export const MemeCommands: React.FC = () => {
  const memeCommands = [
    {
      name: 'meme',
      description: 'Generate random memes from popular subreddits with fresh content daily.',
      usage: '/meme [subreddit]',
      example: '/meme dankmemes',
      category: 'Memes',
      cooldown: '5 seconds',
      icon: <Smile className="w-5 h-5 text-white" />,
      color: 'from-cyan-400 to-blue-500'
    },
    {
      name: 'drake',
      description: 'Create Drake pointing memes with custom text for both panels.',
      usage: '/drake <bad_thing> <good_thing>',
      example: '/drake "Homework" "Gaming"',
      category: 'Memes',
      cooldown: '10 seconds',
      icon: <Image className="w-5 h-5 text-white" />,
      color: 'from-purple-400 to-pink-500'
    },
    {
      name: 'distracted',
      description: 'Generate distracted boyfriend memes with custom labels.',
      usage: '/distracted <boyfriend> <girlfriend> <other_woman>',
      example: '/distracted "Me" "Sleep" "One more episode"',
      category: 'Memes',
      cooldown: '10 seconds',
      icon: <Sparkles className="w-5 h-5 text-white" />,
      color: 'from-yellow-400 to-orange-500'
    },
    {
      name: 'changemymind',
      description: 'Create "Change My Mind" memes with your controversial opinions.',
      usage: '/changemymind <text>',
      example: '/changemymind "Pineapple belongs on pizza"',
      category: 'Memes',
      cooldown: '10 seconds',
      icon: <Star className="w-5 h-5 text-white" />,
      color: 'from-blue-400 to-indigo-500'
    },
    {
      name: 'expanding',
      description: 'Create expanding brain memes with multiple levels of enlightenment.',
      usage: '/expanding <level1> <level2> <level3> <level4>',
      example: '/expanding "Walking" "Running" "Driving" "Flying"',
      category: 'Memes',
      cooldown: '15 seconds',
      icon: <Zap className="w-5 h-5 text-white" />,
      color: 'from-green-400 to-emerald-500'
    },
    {
      name: 'deepfry',
      description: 'Deep fry images with adjustable intensity for maximum meme effect.',
      usage: '/deepfry [image] [intensity]',
      example: '/deepfry @user 5',
      category: 'Memes',
      cooldown: '20 seconds',
      icon: <Camera className="w-5 h-5 text-white" />,
      color: 'from-red-400 to-orange-500'
    },
    {
      name: 'caption',
      description: 'Add custom captions to images with various fonts and styles.',
      usage: '/caption <text> [image]',
      example: '/caption "When you find a bug in production"',
      category: 'Memes',
      cooldown: '10 seconds',
      icon: <Laugh className="w-5 h-5 text-white" />,
      color: 'from-pink-400 to-rose-500'
    },
    {
      name: 'random',
      description: 'Get completely random memes from various sources and formats.',
      usage: '/random',
      example: '/random',
      category: 'Memes',
      cooldown: '3 seconds',
      aliases: ['randommeme'],
      icon: <Shuffle className="w-5 h-5 text-white" />,
      color: 'from-indigo-400 to-purple-500'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center shadow-2xl">
            <Smile className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-bold text-white mb-2">Meme Commands</h1>
            <p className="text-gray-400 text-lg">Generate and customize memes for endless entertainment</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <div className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border border-cyan-500/30 rounded-xl px-4 py-2">
            <span className="text-cyan-400 font-medium">😂 Fresh Content</span>
          </div>
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-xl px-4 py-2">
            <span className="text-purple-400 font-medium">🎨 Custom Templates</span>
          </div>
          <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 border border-yellow-500/30 rounded-xl px-4 py-2">
            <span className="text-yellow-400 font-medium">⚡ Instant Generation</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {memeCommands.map((command, index) => (
          <CommandCard key={index} {...command} />
        ))}
      </div>
    </div>
  );
};