'use client';

import { useState, useEffect, useRef } from 'react';
import { Player } from '../models/types';

interface PlayerTimerProps {
  player: Player;
  initialTime: number;
  onTimerEnd: (playerId: string) => void;
  isCurrentTurn: boolean;
}

export default function PlayerTimer({
  player,
  initialTime,
  onTimerEnd,
  isCurrentTurn
}: PlayerTimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isCurrentTurn) {
      intervalRef.current = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current!); // Clear interval when time runs out
            intervalRef.current = null;
            onTimerEnd(player.id);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      // Clear interval if it's not the current turn
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setTimeLeft(initialTime); // Reset timer when turn changes
    }

    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isCurrentTurn, initialTime, onTimerEnd, player.id, timeLeft]); // Add timeLeft to dependencies

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = () => {
    return (timeLeft / initialTime) * 100;
  };

  return (
    <div 
      className={`
        p-4 border rounded-lg transition-all duration-150 backdrop-blur-sm shadow-sm relative overflow-hidden
        ${isCurrentTurn ? 'border-indigo-500 dark:border-amber-500 ring-2 ring-indigo-500 dark:ring-amber-500' : 'border-gray-300 dark:border-gray-700'}
        ${!player.isAlive ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300 opacity-60' : 
          player.role.team === 'mafia' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100' : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100'}
      `}
    >
      <div className="font-bold text-lg mb-1">{player.name}</div>
      <div className="text-sm font-mono mb-2">Role: {player.role.name}</div>
      <div className="text-3xl font-bold text-center mb-3">{formatTime(timeLeft)}</div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
        <div 
          className={`h-2.5 rounded-full transition-all duration-1000 ease-linear
            ${timeLeft < 10 ? 'bg-red-600 dark:bg-red-400' : 
              timeLeft < 30 ? 'bg-yellow-500 dark:bg-yellow-400' : 'bg-indigo-600 dark:bg-amber-500'}
          `}
          style={{ width: `${getProgress()}%` }}
        ></div>
      </div>

      {!player.isAlive && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold text-xl">ELIMINATED</div>}
    </div>
  );
} 