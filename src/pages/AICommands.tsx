import React from 'react';
import { CommandCard } from '../components/CommandCard';
import { Bot, Brain, MessageSquare, Image, Mic, Eye, Sparkles, Zap } from 'lucide-react';

export const AICommands: React.FC = () => {
  const aiCommands = [
    {
      name: 'chat',
      description: 'Have intelligent conversations with advanced AI powered by GPT-4.',
      usage: '/chat <message>',
      example: '/chat What is the meaning of life?',
      category: 'AI',
      cooldown: '5 seconds',
      aliases: ['ai', 'ask'],
      icon: <MessageSquare className="w-5 h-5 text-white" />,
      color: 'from-violet-400 to-purple-500'
    },
    {
      name: 'imagine',
      description: 'Generate stunning AI artwork from text descriptions.',
      usage: '/imagine <prompt>',
      example: '/imagine A futuristic city at sunset',
      category: 'AI',
      cooldown: '30 seconds',
      aliases: ['generate', 'art'],
      icon: <Image className="w-5 h-5 text-white" />,
      color: 'from-pink-400 to-rose-500'
    },
    {
      name: 'analyze',
      description: 'Analyze images and get detailed AI-powered descriptions.',
      usage: '/analyze [image]',
      example: '/analyze (attach image)',
      category: 'AI',
      cooldown: '10 seconds',
      aliases: ['describe'],
      icon: <Eye className="w-5 h-5 text-white" />,
      color: 'from-blue-400 to-indigo-500'
    },
    {
      name: 'summarize',
      description: 'Summarize long text or articles into key points.',
      usage: '/summarize <text>',
      example: '/summarize (long article text)',
      category: 'AI',
      cooldown: '10 seconds',
      aliases: ['tldr'],
      icon: <Brain className="w-5 h-5 text-white" />,
      color: 'from-green-400 to-emerald-500'
    },
    {
      name: 'translate',
      description: 'Translate text between languages with AI accuracy.',
      usage: '/translate <text> <from> <to>',
      example: '/translate "Hello world" en es',
      category: 'AI',
      cooldown: '5 seconds',
      aliases: ['tr'],
      icon: <Sparkles className="w-5 h-5 text-white" />,
      color: 'from-cyan-400 to-blue-500'
    },
    {
      name: 'code',
      description: 'Generate, explain, or debug code with AI assistance.',
      usage: '/code <language> <description>',
      example: '/code python "Sort a list of numbers"',
      category: 'AI',
      cooldown: '15 seconds',
      aliases: ['programming'],
      icon: <Zap className="w-5 h-5 text-white" />,
      color: 'from-orange-400 to-red-500'
    },
    {
      name: 'voice',
      description: 'Convert text to speech with natural AI voices.',
      usage: '/voice <text> [voice]',
      example: '/voice "Hello everyone!" female',
      category: 'AI',
      cooldown: '20 seconds',
      aliases: ['tts', 'speak'],
      icon: <Mic className="w-5 h-5 text-white" />,
      color: 'from-purple-400 to-pink-500'
    },
    {
      name: 'personality',
      description: 'Set AI personality traits for customized interactions.',
      usage: '/personality <trait> <value>',
      example: '/personality humor high',
      category: 'AI',
      cooldown: '30 seconds',
      permissions: ['Manage Messages'],
      icon: <Bot className="w-5 h-5 text-white" />,
      color: 'from-indigo-400 to-violet-500'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center py-8">
        <div className="inline-flex items-center gap-4 mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-violet-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl">
            <Bot className="w-8 h-8 text-white" />
          </div>
          <div className="text-left">
            <h1 className="text-4xl font-bold text-white mb-2">AI Commands</h1>
            <p className="text-gray-400 text-lg">Cutting-edge AI features powered by advanced models</p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-4">
          <div className="bg-gradient-to-r from-violet-600/20 to-purple-600/20 border border-violet-500/30 rounded-xl px-4 py-2">
            <span className="text-violet-400 font-medium">🤖 GPT-4 Powered</span>
          </div>
          <div className="bg-gradient-to-r from-pink-600/20 to-rose-600/20 border border-pink-500/30 rounded-xl px-4 py-2">
            <span className="text-pink-400 font-medium">🎨 AI Art Generation</span>
          </div>
          <div className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 rounded-xl px-4 py-2">
            <span className="text-blue-400 font-medium">🧠 Smart Analysis</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {aiCommands.map((command, index) => (
          <CommandCard key={index} {...command} />
        ))}
      </div>
    </div>
  );
};