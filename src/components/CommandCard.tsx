import React, { useState } from 'react';
import { Copy, Check, Play, Settings } from 'lucide-react';

interface CommandCardProps {
  name: string;
  description: string;
  usage: string;
  example: string;
  category: string;
  permissions?: string[];
  cooldown?: string;
  aliases?: string[];
  icon: React.ReactNode;
  color: string;
}

export const CommandCard: React.FC<CommandCardProps> = ({
  name,
  description,
  usage,
  example,
  category,
  permissions = [],
  cooldown,
  aliases = [],
  icon,
  color
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 hover:bg-gray-800/70 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl bg-gradient-to-r ${color} shadow-lg`}>
            {icon}
          </div>
          <div>
            <h3 className="text-white font-bold text-lg">{name}</h3>
            <span className="text-gray-400 text-sm">{category}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button className="p-2 text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
            <Play size={16} />
          </button>
          <button className="p-2 text-gray-400 hover:text-white transition-colors opacity-0 group-hover:opacity-100">
            <Settings size={16} />
          </button>
        </div>
      </div>

      <p className="text-gray-300 mb-4 leading-relaxed">{description}</p>

      <div className="space-y-3">
        <div>
          <label className="text-gray-400 text-sm font-medium block mb-1">Usage</label>
          <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-3 flex items-center justify-between">
            <code className="text-blue-400 font-mono text-sm">{usage}</code>
            <button
              onClick={() => copyToClipboard(usage)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-gray-400 text-sm font-medium block mb-1">Example</label>
          <div className="bg-gray-900/50 border border-gray-700/50 rounded-lg p-3 flex items-center justify-between">
            <code className="text-green-400 font-mono text-sm">{example}</code>
            <button
              onClick={() => copyToClipboard(example)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
            </button>
          </div>
        </div>

        {aliases.length > 0 && (
          <div>
            <label className="text-gray-400 text-sm font-medium block mb-1">Aliases</label>
            <div className="flex flex-wrap gap-2">
              {aliases.map((alias) => (
                <span key={alias} className="bg-purple-600/20 text-purple-300 px-2 py-1 rounded-md text-xs">
                  {alias}
                </span>
              ))}
            </div>
          </div>
        )}

        {permissions.length > 0 && (
          <div>
            <label className="text-gray-400 text-sm font-medium block mb-1">Required Permissions</label>
            <div className="flex flex-wrap gap-2">
              {permissions.map((perm) => (
                <span key={perm} className="bg-red-600/20 text-red-300 px-2 py-1 rounded-md text-xs">
                  {perm}
                </span>
              ))}
            </div>
          </div>
        )}

        {cooldown && (
          <div>
            <label className="text-gray-400 text-sm font-medium block mb-1">Cooldown</label>
            <span className="bg-yellow-600/20 text-yellow-300 px-2 py-1 rounded-md text-xs">
              {cooldown}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};