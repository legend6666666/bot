import React from 'react';
import { CommandCard } from '../components/CommandCard';
import { Gamepad2, Dice1, Target, Puzzle, Trophy, Zap, Sword, Crown } from 'lucide-react';

export const GameCommands: React.FC = () => {
  const gameCommands = [
    {
      name: 'trivia',
      description: 'Start a trivia game with multiple categories and difficulty levels.',
      usage: '/trivia [category] [difficulty]',
      example: '/trivia science hard',
      category: 'Games',
      cooldown: '30 seconds',
      icon: <Puzzle className="w-5 h-5 text-white" />,
      color: 'from-blue-400 to-purple-500'
    },
    {
      name: 'rps',
      description: 'Play Rock Paper Scissors against the bot or challenge another user.',
      usage: '/rps <choice> [user]',
      example: '/rps rock @opponent',
      category: 'Games',
      cooldown: '5 seconds',
      aliases: ['rockpaperscissors'],
      icon: <Dice1 className="w-5 h-5 text-white" />,
      color: 'from-green-400 to-blue-500'
    },
    {
      name: 'guess',
      description: 'Number guessing game with customizable ranges and hints.',
      usage: '/guess [min] [max]',
      example: '/guess 1 100',
      category: 'Games',
      cooldown: '10 seconds',
      aliases: ['guessnumber'],
      icon: <Target className="w-5 h-5 text-white" />,
      color: 'from-yellow-400 to-orange-500'
    },
    {
      name: 'hangman',
      description: 'Classic word guessing game with various categories and themes.',
      usage: '/hangman [category]',
      example: '/hangman animals',
      category: 'Games',
      cooldown: '60 seconds',
      icon: <Puzzle className="w-5 h-5 text-white" />,
      color: 'from-purple-400 to-pink-500'
    },
    {
      name: 'duel',
      description: 'Challenge another user to an epic battle with RPG elements.',
      usage: '/duel <user>',
      example: '/duel @rival',
      category: 'Games',
      cooldown: '120 seconds',
      aliases: ['battle', 'fight'],
      icon: <Sword className="w-5 h-5 text-white" />,
      color: 'from-red-400 to-orange-500'
    },
    {
      name: 'slots',
      description: 'Spin the slot machine and try your luck for big rewards.',
      usage: '/slots [bet]',
      example: '/slots 100',
      category: 'Games',
      cooldown: '15 seconds',
      icon: <Zap className="w-5 h-5 text-white" />,
      color: 'from-cyan-400 to-blue-500'
    },
    {
      name: 'leaderboard',
      description: 'View game leaderboards and compete for the top spot.',
      usage: '/leaderboard <game>',
      example: '/leaderboard trivia',
      category: 'Games',
      cooldown: '10 seconds',
      aliases: ['lb'],
      icon: <Trophy className="w-5 h-5 text-white" />,
      color: 'from-yellow-400 to-red-500'
    },
    {
      name: 'tournament',
      description: 'Create or join tournaments with brackets and prizes.',
      usage: '/tournament <create|join> [game]',
      example: '/tournament create trivia',
      category: 'Games',
      cooldown: '300 seconds',
      permissions: ['Manage Events'],
      icon: <Crown className="w-5 h-5 text-white" />,
      color: 'from-purple-400 to-pink-500'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-2xl">
            <Gamepad2 className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-bold text-white mb-2">Game Commands</h1>
            <p className="text-gray-400 text-lg">Fun games and activities to engage your community</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <div className="bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border border-purple-500/30 rounded-xl px-4 py-2">
            <span className="text-purple-400 font-medium">🎮 Interactive Games</span>
          </div>
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30 rounded-xl px-4 py-2">
            <span className="text-blue-400 font-medium">🏆 Leaderboards</span>
          </div>
          <div className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border border-green-500/30 rounded-xl px-4 py-2">
            <span className="text-green-400 font-medium">🎯 Skill-based</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {gameCommands.map((command, index) => (
          <CommandCard key={index} {...command} />
        ))}
      </div>
    </div>
  );
};