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
    <div className="bg-gray-900 rounded-xl shadow-lg p-6 max-w-md w-full mx-auto min-h-[320px] flex flex-col border border-gray-700">
      {!isRevealed ? (
        <div className="flex flex-col items-center justify-center flex-grow">
          <h2 className="text-2xl font-bold mb-4 text-amber-500">{player.name}</h2>
          <p className="mb-6 text-gray-400">Click to reveal your role</p>
          <button
            onClick={handleReveal}
            className="bg-amber-600 text-white py-3 px-8 rounded-lg hover:bg-amber-500 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Reveal Role
          </button>
        </div>
      ) : (
        <div className="flex flex-col flex-grow">
          <div className="flex-grow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-amber-500">{player.name}</h2>
              <span 
                className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  player.role.team === 'mafia' 
                    ? 'bg-red-900 text-red-100' 
                    : 'bg-blue-900 text-blue-100'
                }`}
              >
                {player.role.team.charAt(0).toUpperCase() + player.role.team.slice(1)}
              </span>
            </div>
            
            <h3 className="text-xl font-bold mb-2 text-white">
              {player.role.name}
            </h3>
            
            <p className="mb-4 text-gray-300">{player.role.description}</p>
            
            {player.role.ability && (
              <div className="mb-4 p-3 bg-gray-800 rounded-lg">
                <h4 className="font-semibold text-amber-400">Ability:</h4>
                <p className="text-gray-300">{player.role.ability}</p>
              </div>
            )}
          </div>
          
          <button
            onClick={handleNext}
            className="w-full bg-amber-600 text-white py-3 px-4 rounded-lg hover:bg-amber-500 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-900 mt-4"
          >
            {isLast ? 'Start Game' : 'Next Player'}
          </button>
        </div>
      )}
    </div>
  );
} 