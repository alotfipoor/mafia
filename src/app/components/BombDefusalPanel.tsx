'use client';

import { useState } from 'react';
import { useGameContext } from '../context/GameContext';

export default function BombDefusalPanel() {
  const { gameState, attemptDefuseBomb, eliminatePlayer, addToGameLog } = useGameContext();
  
  const [guessedCode, setGuessedCode] = useState<number>(1);
  const [showPanel, setShowPanel] = useState<boolean>(false);
  
  // Only show for Zodiac scenario during day phase when a bomb is active
  if (!gameState || 
      gameState.scenario !== 'zodiac' || 
      gameState.phase !== 'day' || 
      !gameState.zodiacScenario?.bombActive) {
    return null;
  }
  
  const targetPlayerId = gameState.zodiacScenario.bombTarget;
  const targetPlayer = targetPlayerId ? gameState.players.find(p => p.id === targetPlayerId) : null;
  
  const handleDefuseAttempt = () => {
    if (!gameState.zodiacScenario?.bombActive) return;
    
    const success = attemptDefuseBomb(guessedCode);
    
    if (!success) {
      // If bomb defusal fails and it's the last attempt, player is eliminated
      if (targetPlayer) {
        eliminatePlayer(targetPlayerId!);
        addToGameLog(`${targetPlayer.name} failed to defuse the bomb and was eliminated!`);
      }
    }
    
    setShowPanel(false);
  };
  
  return (
    <div className="fixed bottom-4 left-4 z-10">
      {!showPanel ? (
        <button
          onClick={() => setShowPanel(true)}
          className="px-4 py-2 bg-red-600/90 text-white rounded-lg shadow-lg hover:bg-red-500 transition-colors animate-pulse"
        >
          ⚠️ Defuse Bomb
        </button>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-red-500 max-w-sm w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-red-600">Bomb Defusal</h2>
            <button
              onClick={() => setShowPanel(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="mb-4">
            <p className="text-gray-600 dark:text-gray-300 mb-2">
              {targetPlayer 
                ? `${targetPlayer.name} has a bomb! Guess the correct code to defuse it.` 
                : 'A player has a bomb! Guess the correct code to defuse it.'}
            </p>
            
            <div className="mb-4">
              <h3 className="text-md font-semibold mb-2 text-gray-800 dark:text-gray-200">Enter Code:</h3>
              <div className="flex space-x-2 justify-center">
                {[1, 2, 3, 4].map(code => (
                  <button
                    key={code}
                    onClick={() => setGuessedCode(code)}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors text-lg font-bold ${
                      guessedCode === code 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-4">
            <button
              onClick={handleDefuseAttempt}
              className="w-full py-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition-colors"
            >
              Attempt Defusal
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 