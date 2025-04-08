'use client';

import { useState } from 'react';
import { Player } from '../models/types';
import RoleCard from './RoleCard';
import { useGameContext } from '../context/GameContext';

interface RoleRevealProps {
  players: Player[];
  onComplete: () => void;
}

export default function RoleReveal({ players, onComplete }: RoleRevealProps) {
  const { resetGame } = useGameContext();
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  const handleNextPlayer = () => {
    if (currentPlayerIndex < players.length - 1) {
      setCurrentPlayerIndex(currentPlayerIndex + 1);
    } else {
      onComplete();
    }
  };

  const currentPlayer = players[currentPlayerIndex];
  const isLastPlayer = currentPlayerIndex === players.length - 1;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-amber-500">Role Reveal</h1>
        <button 
          onClick={resetGame}
          className="text-gray-400 hover:text-amber-500 transition-colors"
          aria-label="Return to home"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
      </div>

      <div className="mb-4 text-center">
        <p className="text-gray-400">
          Player {currentPlayerIndex + 1} of {players.length}
        </p>
        <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
          <div className="bg-amber-600 h-2.5 rounded-full" style={{ width: `${((currentPlayerIndex + 1) / players.length) * 100}%` }}></div>
        </div>
      </div>

      <RoleCard 
        player={currentPlayer} 
        onNext={handleNextPlayer} 
        isLast={isLastPlayer} 
      />

      <div className="mt-6 text-center text-gray-400">
        <p>Pass the device to {currentPlayer.name} and click Reveal Role</p>
      </div>
    </div>
  );
} 