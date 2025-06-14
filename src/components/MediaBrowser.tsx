import React, { useState } from 'react';
import { Upload, Film, Image, Music, Folder, Search, Grid, List } from 'lucide-react';

interface MediaItem {
  id: string;
  name: string;
  type: 'video' | 'audio' | 'image';
  duration?: number;
  size: string;
  thumbnail?: string;
}

interface MediaBrowserProps {
  onSelectMedia: (media: MediaItem) => void;
}

export const MediaBrowser: React.FC<MediaBrowserProps> = ({ onSelectMedia }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('all');

  const mockMedia: MediaItem[] = [
    {
      id: '1',
      name: 'Sample Video 1.mp4',
      type: 'video',
      duration: 120,
      size: '45.2 MB',
      thumbnail: 'https://images.pexels.com/photos/3945313/pexels-photo-3945313.jpeg?auto=compress&cs=tinysrgb&w=150&h=100&fit=crop'
    },
    {
      id: '2',
      name: 'Background Music.mp3',
      type: 'audio',
      duration: 180,
      size: '8.5 MB'
    },
    {
      id: '3',
      name: 'Title Image.png',
      type: 'image',
      size: '2.1 MB',
      thumbnail: 'https://images.pexels.com/photos/1591447/pexels-photo-1591447.jpeg?auto=compress&cs=tinysrgb&w=150&h=100&fit=crop'
    }
  ];

  const filteredMedia = mockMedia.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Film size={16} className="text-blue-400" />;
      case 'audio': return <Music size={16} className="text-green-400" />;
      case 'image': return <Image size={16} className="text-purple-400" />;
      default: return <Film size={16} />;
    }
  };

  return (
    <div className="bg-gray-900 border-r border-gray-700 w-80 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-white font-semibold mb-3">Media Browser</h2>
        
        {/* Search */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search media..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-800 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* View Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <Grid size={16} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
            >
              <List size={16} />
            </button>
          </div>
          
          <button className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-2 rounded-lg flex items-center gap-2 transition-colors">
            <Upload size={16} />
            Import
          </button>
        </div>
      </div>

      {/* Folder Navigation */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
          <Folder size={16} />
          <span>Folders</span>
        </div>
        <div className="space-y-1">
          {['All Media', 'Videos', 'Audio', 'Images'].map((folder) => (
            <button
              key={folder}
              onClick={() => setSelectedFolder(folder.toLowerCase().replace(' ', ''))}
              className={`w-full text-left px-3 py-2 rounded transition-colors ${
                selectedFolder === folder.toLowerCase().replace(' ', '')
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              {folder}
            </button>
          ))}
        </div>
      </div>

      {/* Media Items */}
      <div className="flex-1 p-4 overflow-y-auto">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-3">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectMedia(item)}
                className="bg-gray-800 rounded-lg p-3 cursor-pointer hover:bg-gray-700 transition-colors group"
              >
                {item.thumbnail ? (
                  <div className="aspect-video bg-gray-700 rounded mb-2 overflow-hidden">
                    <img
                      src={item.thumbnail}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                ) : (
                  <div className="aspect-video bg-gray-700 rounded mb-2 flex items-center justify-center">
                    {getTypeIcon(item.type)}
                  </div>
                )}
                <div className="text-white text-sm font-medium truncate mb-1">
                  {item.name}
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{item.size}</span>
                  {item.duration && <span>{formatDuration(item.duration)}</span>}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMedia.map((item) => (
              <div
                key={item.id}
                onClick={() => onSelectMedia(item)}
                className="bg-gray-800 rounded-lg p-3 cursor-pointer hover:bg-gray-700 transition-colors flex items-center gap-3"
              >
                <div className="w-12 h-8 bg-gray-700 rounded flex items-center justify-center flex-shrink-0">
                  {getTypeIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-medium truncate">
                    {item.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    {item.size} {item.duration && `• ${formatDuration(item.duration)}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};