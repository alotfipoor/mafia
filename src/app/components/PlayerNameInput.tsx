'use client';

import { useState, useEffect } from 'react';
import { ScenarioType } from '../models/types';
import { useGameContext } from '../context/GameContext';

interface PlayerNameInputProps {
  playerCount: number;
  scenario: ScenarioType;
  onSubmit: (playerNames: string[]) => void;
  onBack: () => void;
}

export default function PlayerNameInput({ 
  playerCount, 
  scenario, 
  onSubmit, 
  onBack 
}: PlayerNameInputProps) {
  const { resetGame } = useGameContext();
  const [playerNames, setPlayerNames] = useState<string[]>(
    Array(playerCount).fill('').map((_, i) => `Player ${i + 1}`)
  );

  useEffect(() => {
    // Update player names array when playerCount changes
    setPlayerNames(prev => {
      if (prev.length < playerCount) {
        // Add more player name fields
        return [
          ...prev,
          ...Array(playerCount - prev.length)
            .fill('')
            .map((_, i) => `Player ${prev.length + i + 1}`)
        ];
      } else if (prev.length > playerCount) {
        // Remove extra player name fields
        return prev.slice(0, playerCount);
      }
      return prev;
    });
  }, [playerCount]);

  const handleNameChange = (index: number, newName: string) => {
    const newPlayerNames = [...playerNames];
    newPlayerNames[index] = newName;
    setPlayerNames(newPlayerNames);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ensure all names are filled
    if (playerNames.some(name => !name.trim())) {
      alert('Please enter a name for all players.');
      return;
    }
    onSubmit(playerNames);
  };

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-lg p-6 w-full max-w-2xl mx-auto border border-gray-200 dark:border-gray-700 backdrop-blur-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-indigo-600 dark:text-amber-500">Enter Player Names</h2>
        <button 
          onClick={resetGame}
          className="text-gray-600 dark:text-gray-400 hover:text-indigo-500 dark:hover:text-amber-500 transition-colors"
          aria-label="Reset game"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
        </button>
      </div>
      
      <p className="text-gray-600 dark:text-gray-400 mb-6">
        Setting up a {scenario} game with {playerCount} players.
      </p>
      
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {playerNames.map((name, index) => (
            <div key={index} className="mb-3">
              <label 
                htmlFor={`player-${index}`}
                className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
              >
                Player {index + 1}
              </label>
              <input
                id={`player-${index}`}
                type="text"
                value={name}
                onChange={(e) => handleNameChange(index, e.target.value)}
                placeholder={`Player ${index + 1}`}
                className="w-full p-3 bg-white/90 dark:bg-gray-800/90 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-amber-500"
                required
              />
            </div>
          ))}
        </div>
        
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 bg-gray-200/90 dark:bg-gray-700/90 text-gray-800 dark:text-white py-3 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
          >
            Back
          </button>
          <button
            type="submit"
            className="flex-1 bg-indigo-600 dark:bg-amber-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-500 dark:hover:bg-amber-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
          >
            Start Game
          </button>
        </div>
      </form>
    </div>
  );
} 