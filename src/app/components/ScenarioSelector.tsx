'use client';

import { useState } from 'react';
import { ScenarioType } from '../models/types';

interface ScenarioSelectorProps {
  onSelect: (scenario: ScenarioType, playerCount: number) => void;
}

export default function ScenarioSelector({ onSelect }: ScenarioSelectorProps) {
  const [scenario, setScenario] = useState<ScenarioType>('classic');
  const [playerCount, setPlayerCount] = useState<number>(
    scenario === 'classic' ? 6 :
    scenario === 'capo' ? 12 :
    scenario === 'zodiac' ? 9 :
    scenario === 'jack' ? 9 : 6
  );

  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newScenario = e.target.value as ScenarioType;
    setScenario(newScenario);
    
    // Adjust player count based on scenario selection
    if (newScenario === 'capo' && playerCount < 12) {
      setPlayerCount(12);
    } else if (newScenario === 'zodiac' && playerCount < 9) {
      setPlayerCount(9);
    } else if (newScenario === 'jack' && playerCount < 9) {
      setPlayerCount(9);
    } else if (newScenario === 'classic' && playerCount < 6) {
      setPlayerCount(6);
    }
  };

  const getMinPlayers = () => {
    switch(scenario) {
      case 'capo': return 12;
      case 'zodiac': return 9;
      case 'jack': return 9;
      default: return 6; // classic
    }
  };
  
  const getMaxPlayers = () => {
    switch(scenario) {
      case 'capo': return 13;
      case 'zodiac': return 12;
      case 'jack': return 12;
      default: return 15; // classic
    }
  };

  const getScenarioDescription = () => {
    switch(scenario) {
      case 'capo':
        return 'Capo Scenario: Complex game with 12-13 players and special roles.';
      case 'zodiac':
        return 'Zodiac Scenario: Includes an independent serial killer role (Zodiac) playing solo.';
      case 'jack':
        return 'Jack Scenario: Features Jack Sparrow as an independent role who must win alone.';
      default:
        return 'Classic Scenario: Traditional game with simpler roles.';
    }
  };

  return (
    <div className="bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-lg p-6 max-w-md w-full mx-auto border border-gray-200 dark:border-gray-700 backdrop-blur-md">
      <h2 className="text-2xl font-bold mb-6 text-indigo-600 dark:text-amber-500">Game Setup</h2>
      
      <div className="mb-6">
        <label htmlFor="scenario" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
          Choose Scenario
        </label>
        <select
          id="scenario"
          value={scenario}
          onChange={handleScenarioChange}
          className="w-full p-3 bg-gray-50/90 dark:bg-gray-800/90 border border-gray-300 dark:border-gray-700 text-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-amber-500"
        >
          <option value="classic">Classic Mafia</option>
          <option value="capo">Capo Scenario</option>
          <option value="zodiac">Zodiac Scenario</option>
          <option value="jack">Jack Sparrow Scenario</option>
        </select>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {getScenarioDescription()}
        </p>
      </div>
      
      <div className="mb-6">
        <label htmlFor="playerCount" className="block text-gray-700 dark:text-gray-300 font-medium mb-2">
          Number of Players: {playerCount}
        </label>
        <input
          id="playerCount"
          type="range"
          min={getMinPlayers()}
          max={getMaxPlayers()}
          value={playerCount}
          onChange={(e) => setPlayerCount(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mt-1">
          <span>{getMinPlayers()}</span>
          <span>{getMaxPlayers()}</span>
        </div>
      </div>
      
      <button
        onClick={() => onSelect(scenario, playerCount)}
        className="w-full bg-indigo-600 dark:bg-amber-600 text-white py-3 px-4 rounded-lg hover:bg-indigo-500 dark:hover:bg-amber-500 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-gray-900"
      >
        Continue to Player Setup
      </button>
    </div>
  );
} 