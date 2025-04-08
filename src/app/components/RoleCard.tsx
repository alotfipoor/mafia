'use client';

import { useState } from 'react';
import { Player } from '../models/types';

interface RoleCardProps {
  player: Player;
  onNext?: () => void;
  isLast?: boolean;
}

export default function RoleCard({ player, onNext, isLast = false }: RoleCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  const handleReveal = () => {
    setIsRevealed(true);
  };

  const handleNext = () => {
    setIsRevealed(false);
    if (onNext) onNext();
  };

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-lg p-6 max-w-md w-full mx-auto min-h-[320px] flex flex-col border border-gray-200 dark:border-gray-700 backdrop-blur-md">
      {!isRevealed ? (
        <div className="flex flex-col items-center justify-center flex-grow">
          <h2 className="text-2xl font-bold mb-4 text-indigo-600 dark:text-amber-500">{player.name}</h2>
          <p className="mb-6 text-gray-600 dark:text-gray-400">Click to reveal your role</p>
          <button
            onClick={handleReveal}
            className="bg-indigo-600 dark:bg-amber-600 text-white py-3 px-8 rounded-lg hover:bg-indigo-500 dark:hover:bg-amber-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 shadow-lg"
          >
            Reveal Role
          </button>
        </div>
      ) : (
        <div className="flex flex-col flex-grow">
          <div className="flex-grow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-indigo-600 dark:text-amber-500">{player.name}</h2>
              <span 
                className={`px-3 py-1 rounded-full text-sm font-semibold shadow-sm ${
                  player.role.team === 'mafia' 
                    ? 'bg-red-100/90 dark:bg-red-900/90 text-red-800 dark:text-red-100' 
                    : 'bg-blue-100/90 dark:bg-blue-900/90 text-blue-800 dark:text-blue-100'
                }`}
              >
                {player.role.team.charAt(0).toUpperCase() + player.role.team.slice(1)}
              </span>
            </div>
            
            <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
              {player.role.name}
            </h3>
            
            <p className="mb-4 text-gray-700 dark:text-gray-300">{player.role.description}</p>
            
            {player.role.ability && (
              <div className="mb-4 p-3 bg-gray-100/80 dark:bg-gray-800/80 rounded-lg">
                <h4 className="font-semibold text-indigo-600 dark:text-amber-400">Ability:</h4>
                <p className="text-gray-700 dark:text-gray-300">{player.role.ability}</p>
              </div>
            )}
          </div>
          
          <button
            onClick={handleNext}
            className="w-full bg-indigo-600 dark:bg-amber-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-500 dark:hover:bg-amber-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900 mt-4 shadow-md"
          >
            {isLast ? 'Start Game' : 'Next Player'}
          </button>
        </div>
      )}
    </div>
  );
} 