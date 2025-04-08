'use client';

import { useState } from 'react';
import { ScenarioType } from '../models/types';

interface ScenarioSelectorProps {
  onSelect: (scenario: ScenarioType, playerCount: number) => void;
}

export default function ScenarioSelector({ onSelect }: ScenarioSelectorProps) {
  const [scenario, setScenario] = useState<ScenarioType>('classic');
  const [playerCount, setPlayerCount] = useState<number>(
    scenario === 'capo' ? 12 : 6
  );

  const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newScenario = e.target.value as ScenarioType;
    setScenario(newScenario);
    
    // Adjust player count based on scenario selection
    if (newScenario === 'capo' && playerCount < 12) {
      setPlayerCount(12);
    } else if (newScenario === 'classic' && playerCount < 6) {
      setPlayerCount(6);
    }
  };

  const getMinPlayers = () => (scenario === 'capo' ? 12 : 6);
  const getMaxPlayers = () => (scenario === 'capo' ? 13 : 15);

  return (
    <div className="bg-gray-900 rounded-xl shadow-lg p-6 max-w-md w-full mx-auto border border-gray-700">
      <h2 className="text-2xl font-bold mb-6 text-amber-500">Game Setup</h2>
      
      <div className="mb-6">
        <label htmlFor="scenario" className="block text-gray-300 font-medium mb-2">
          Choose Scenario
        </label>
        <select
          id="scenario"
          value={scenario}
          onChange={handleScenarioChange}
          className="w-full p-3 bg-gray-800 border border-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="classic">Classic Mafia</option>
          <option value="capo">Capo Scenario</option>
        </select>
        <p className="mt-2 text-sm text-gray-400">
          {scenario === 'capo' 
            ? 'Capo Scenario: Complex game with 12-13 players and special roles.' 
            : 'Classic Scenario: Traditional game with simpler roles.'}
        </p>
      </div>
      
      <div className="mb-6">
        <label htmlFor="playerCount" className="block text-gray-300 font-medium mb-2">
          Number of Players: {playerCount}
        </label>
        <input
          id="playerCount"
          type="range"
          min={getMinPlayers()}
          max={getMaxPlayers()}
          value={playerCount}
          onChange={(e) => setPlayerCount(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{getMinPlayers()}</span>
          <span>{getMaxPlayers()}</span>
        </div>
      </div>
      
      <button
        onClick={() => onSelect(scenario, playerCount)}
        className="w-full bg-amber-600 text-white py-3 px-4 rounded-lg hover:bg-amber-500 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-gray-900"
      >
        Continue to Player Setup
      </button>
    </div>
  );
} 