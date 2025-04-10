'use client';

import { useState, useEffect, useRef } from 'react';

interface PlayerTimerProps {
  duration?: 40 | 60 | 90; // Duration in seconds
  onComplete?: () => void;
  isActive?: boolean;
  playerName?: string;
}

export default function PlayerTimer({ 
  duration = 60, 
  onComplete, 
  isActive = false,
  playerName = 'Player'
}: PlayerTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number>(duration);
  const [isPaused, setIsPaused] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Reset timer when duration or isActive changes
  useEffect(() => {
    setTimeLeft(duration);
    setIsPaused(true);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [duration, isActive]);
  
  // Timer logic
  useEffect(() => {
    if (!isPaused && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          const newTime = prevTime - 1;
          
          if (newTime <= 0) {
            if (timerRef.current) clearInterval(timerRef.current);
            if (onComplete) onComplete();
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, onComplete]);
  
  const toggleTimer = () => {
    setIsPaused(prev => !prev);
  };
  
  const resetTimer = () => {
    setTimeLeft(duration);
    setIsPaused(true);
  };
  
  // Calculate minutes and seconds
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  // Calculate progress percentage
  const progressPercentage = ((duration - timeLeft) / duration) * 100;
  
  // Color changes based on time left
  const getTimerColor = () => {
    if (timeLeft > duration * 0.6) return 'bg-green-500';
    if (timeLeft > duration * 0.3) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  if (!isActive) return null;
  
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-900/95 shadow-md backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-gray-800 flex items-center justify-center text-xl font-bold text-indigo-600 dark:text-amber-500">
              {minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
            </div>
            <div className="flex flex-col">
              <span className="text-sm text-gray-500 dark:text-gray-400">Speaking Time</span>
              <span className="font-bold text-lg text-gray-800 dark:text-gray-200">{playerName}</span>
            </div>
          </div>
          
          <div className="flex-1 max-w-md relative h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`absolute left-0 top-0 h-full ${getTimerColor()} transition-all duration-1000 ease-linear`}
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={toggleTimer}
              className={`px-4 py-2 rounded-lg transition-colors ${
                isPaused 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-amber-500 hover:bg-amber-600 text-white'
              }`}
            >
              {isPaused ? 'Start' : 'Pause'}
            </button>
            <button
              onClick={resetTimer}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 