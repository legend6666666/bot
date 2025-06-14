import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward } from 'lucide-react';

interface VideoPlayerProps {
  src?: string;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  onTimeUpdate: (time: number) => void;
  onLoadedMetadata: (duration: number) => void;
  onPlayPause: () => void;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  src,
  currentTime,
  duration,
  isPlaying,
  onTimeUpdate,
  onLoadedMetadata,
  onPlayPause
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  }, [isPlaying]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.currentTime = currentTime;
    }
  }, [currentTime]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      onTimeUpdate(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      onLoadedMetadata(videoRef.current.duration);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const skipBackward = () => {
    const newTime = Math.max(0, currentTime - 10);
    onTimeUpdate(newTime);
  };

  const skipForward = () => {
    const newTime = Math.min(duration, currentTime + 10);
    onTimeUpdate(newTime);
  };

  return (
    <div className="relative w-full h-full bg-black rounded-lg overflow-hidden">
      {src ? (
        <video
          ref={videoRef}
          src={src}
          className="w-full h-full object-contain"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-gray-400">
          <div className="text-center">
            <div className="text-6xl mb-4">🎬</div>
            <p className="text-lg">No video loaded</p>
            <p className="text-sm mt-2">Import a video to start editing</p>
          </div>
        </div>
      )}
      
      {/* Video Controls Overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={skipBackward}
            className="text-white hover:text-blue-400 transition-colors"
          >
            <SkipBack size={20} />
          </button>
          
          <button
            onClick={onPlayPause}
            className="bg-blue-600 hover:bg-blue-500 text-white rounded-full p-3 transition-all duration-200 hover:scale-105"
          >
            {isPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
          
          <button
            onClick={skipForward}
            className="text-white hover:text-blue-400 transition-colors"
          >
            <SkipForward size={20} />
          </button>
          
          <div className="flex items-center gap-2 text-white ml-auto">
            <button onClick={toggleMute} className="hover:text-blue-400 transition-colors">
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-20 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
            <button className="hover:text-blue-400 transition-colors">
              <Maximize size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};