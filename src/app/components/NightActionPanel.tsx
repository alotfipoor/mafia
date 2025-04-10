'use client';

import React, { useState } from 'react';
import { useGameContext } from '../context/GameContext';
import { Player } from '../models/types';

const NightActionPanel = () => {
  const { gameState, addToGameLog } = useGameContext();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('mafia');
  const [actionType, setActionType] = useState<string>('kill');
  
  const performNightAction = () => {
    if (!selectedPlayer || !gameState) return;
    
    // Create a log entry for the night action
    const logEntry = `Night ${gameState.round}: ${actionType} action on ${selectedPlayer.name} by ${selectedRole}`;
    
    // Add the log entry
    addToGameLog(logEntry);
    
    // Close the panel after performing action
    document.getElementById('night-actions-panel')?.classList.add('hidden');
    
    // Reset state
    setSelectedPlayer(null);
  };
  
  // Only display for night phase after round 1
  if (!gameState || gameState.phase !== 'night' || gameState.round < 2) {
    return null;
  }

  // Filter out dead players
  const alivePlayers = gameState.players.filter((p: Player) => p.isAlive);
  
  // Render inside the existing night-actions-panel container
  return (
    <>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Role
        </label>
        <select
          value={selectedRole}
          onChange={(e) => setSelectedRole(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          <option value="mafia">Mafia</option>
          <option value="doctor">Doctor</option>
          <option value="detective">Detective</option>
          <option value="sniper">Sniper</option>
          <option value="bodyguard">Bodyguard</option>
          {gameState.scenario === 'capo' && (
            <>
              <option value="capo">Capo</option>
              <option value="herbalist">Herbalist</option>
            </>
          )}
          {gameState.scenario === 'zodiac' && (
            <>
              <option value="bomber">Bomber</option>
              <option value="fortune-teller">Fortune Teller</option>
            </>
          )}
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Action
        </label>
        <select
          value={actionType}
          onChange={(e) => setActionType(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
        >
          {selectedRole === 'mafia' && <option value="kill">Kill</option>}
          {selectedRole === 'doctor' && <option value="save">Save</option>}
          {selectedRole === 'detective' && <option value="investigate">Investigate</option>}
          {selectedRole === 'sniper' && <option value="shoot">Shoot</option>}
          {selectedRole === 'bodyguard' && <option value="protect">Protect</option>}
          {selectedRole === 'capo' && <>
            <option value="trust">Select Trustee</option>
            <option value="bullet">Give Bullet</option>
          </>}
          {selectedRole === 'herbalist' && <option value="poison">Poison</option>}
          {selectedRole === 'bomber' && <option value="plant-bomb">Plant Bomb</option>}
          {selectedRole === 'fortune-teller' && <option value="foresee">Foresee</option>}
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Target Player
        </label>
        <div className="grid grid-cols-2 gap-2">
          {alivePlayers.map((player: Player) => (
            <button
              key={player.id}
              className={`p-2 border rounded-md ${
                selectedPlayer?.id === player.id
                  ? 'bg-indigo-100 dark:bg-indigo-900 border-indigo-500 dark:border-indigo-600'
                  : 'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600'
              } text-gray-700 dark:text-gray-200`}
              onClick={() => setSelectedPlayer(player)}
            >
              {player.name}
            </button>
          ))}
        </div>
      </div>
      
      <button
        onClick={performNightAction}
        disabled={!selectedPlayer}
        className={`w-full py-2 px-4 rounded-md ${
          !selectedPlayer
            ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed'
            : 'bg-indigo-600 dark:bg-amber-600 hover:bg-indigo-700 dark:hover:bg-amber-700'
        } text-white font-medium`}
      >
        Perform Night Action
      </button>
    </>
  );
};

export default NightActionPanel; 