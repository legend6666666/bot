import React, { useRef, useEffect, useState } from 'react';
import { Scissors, Copy, Trash2 } from 'lucide-react';

interface TimelineProps {
  duration: number;
  currentTime: number;
  onTimeChange: (time: number) => void;
  clips: VideoClip[];
  onClipUpdate: (clips: VideoClip[]) => void;
}

interface VideoClip {
  id: string;
  start: number;
  end: number;
  duration: number;
  name: string;
}

export const Timeline: React.FC<TimelineProps> = ({
  duration,
  currentTime,
  onTimeChange,
  clips,
  onClipUpdate
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedClip, setSelectedClip] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);

  const handleTimelineClick = (e: React.MouseEvent) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const timePercent = clickX / rect.width;
      const newTime = timePercent * duration;
      onTimeChange(Math.max(0, Math.min(duration, newTime)));
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 30);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  const generateTimeMarkers = () => {
    const markers = [];
    const step = duration / 10;
    for (let i = 0; i <= 10; i++) {
      const time = i * step;
      markers.push(
        <div key={i} className="flex flex-col items-center">
          <div className="w-px h-4 bg-gray-600"></div>
          <span className="text-xs text-gray-400 mt-1">{formatTime(time)}</span>
        </div>
      );
    }
    return markers;
  };

  const cutClip = () => {
    if (selectedClip && clips.length > 0) {
      const clip = clips.find(c => c.id === selectedClip);
      if (clip && currentTime >= clip.start && currentTime <= clip.end) {
        const newClips = clips.filter(c => c.id !== selectedClip);
        const leftClip: VideoClip = {
          ...clip,
          id: `${clip.id}_left`,
          end: currentTime,
          duration: currentTime - clip.start
        };
        const rightClip: VideoClip = {
          ...clip,
          id: `${clip.id}_right`,
          start: currentTime,
          duration: clip.end - currentTime
        };
        onClipUpdate([...newClips, leftClip, rightClip]);
        setSelectedClip(null);
      }
    }
  };

  const deleteClip = () => {
    if (selectedClip) {
      const newClips = clips.filter(c => c.id !== selectedClip);
      onClipUpdate(newClips);
      setSelectedClip(null);
    }
  };

  return (
    <div className="bg-gray-900 border-t border-gray-700 p-4">
      {/* Timeline Controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <span className="text-white font-medium">Timeline</span>
          <div className="flex items-center gap-2">
            <button
              onClick={cutClip}
              disabled={!selectedClip}
              className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white px-3 py-1 rounded flex items-center gap-2 transition-colors"
            >
              <Scissors size={14} />
              Cut
            </button>
            <button
              disabled={!selectedClip}
              className="bg-gray-700 hover:bg-gray-600 disabled:bg-gray-800 disabled:text-gray-600 text-white px-3 py-1 rounded flex items-center gap-2 transition-colors"
            >
              <Copy size={14} />
              Copy
            </button>
            <button
              onClick={deleteClip}
              disabled={!selectedClip}
              className="bg-red-700 hover:bg-red-600 disabled:bg-gray-800 disabled:text-gray-600 text-white px-3 py-1 rounded flex items-center gap-2 transition-colors"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Zoom:</span>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
            className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
          />
          <span className="text-gray-400 text-sm">{Math.round(zoom * 100)}%</span>
        </div>
      </div>

      {/* Time Markers */}
      <div className="flex justify-between mb-2 px-2">
        {generateTimeMarkers()}
      </div>

      {/* Timeline Track */}
      <div className="relative">
        <div
          ref={timelineRef}
          className="relative h-20 bg-gray-800 rounded-lg border border-gray-700 cursor-pointer overflow-hidden"
          onClick={handleTimelineClick}
          style={{ transformOrigin: 'left', transform: `scaleX(${zoom})` }}
        >
          {/* Video Clips */}
          {clips.map((clip) => (
            <div
              key={clip.id}
              className={`absolute top-2 h-16 rounded transition-all duration-200 cursor-pointer ${
                selectedClip === clip.id
                  ? 'bg-blue-600 border-2 border-blue-400'
                  : 'bg-purple-600 hover:bg-purple-500 border border-purple-400'
              }`}
              style={{
                left: `${(clip.start / duration) * 100}%`,
                width: `${(clip.duration / duration) * 100}%`
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedClip(clip.id);
              }}
            >
              <div className="p-2 text-white text-sm font-medium truncate">
                {clip.name}
              </div>
              <div className="absolute bottom-1 right-2 text-xs text-gray-200">
                {formatTime(clip.duration)}
              </div>
            </div>
          ))}

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-10 pointer-events-none"
            style={{ left: `${(currentTime / duration) * 100}%` }}
          >
            <div className="absolute -top-2 -left-2 w-4 h-4 bg-red-500 rounded-full"></div>
          </div>
        </div>

        {/* Current Time Display */}
        <div className="mt-2 text-center">
          <span className="bg-gray-800 text-white px-3 py-1 rounded text-sm font-mono">
            {formatTime(currentTime)} / {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
};