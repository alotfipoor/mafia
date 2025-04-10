'use client';

import { useState } from 'react';
import { Player, Role } from '../models/types';
import { useGameContext } from '../context/GameContext';

export default function NightActionPanel() {
  const { 
    gameState, 
    eliminatePlayer,
    savePlayerRole,
    addToGameLog,
    blockPlayerAbility,
    placeBomb,
    checkPlayerRole
  } = useGameContext();
  
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [bombCode, setBombCode] = useState<number>(1);
  const [showPanel, setShowPanel] = useState<boolean>(false);
  
  if (!gameState || gameState.phase !== 'night' || gameState.round === 1) return null;
  
  const livingPlayers = gameState.players.filter(p => p.isAlive);
  
  const handleActionSelect = (action: string) => {
    setSelectedAction(action);
    setSelectedPlayer(null);
  };
  
  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayer(playerId);
  };
  
  const performAction = () => {
    if (!selectedAction || !selectedPlayer) return;
    
    const targetPlayer = gameState.players.find(p => p.id === selectedPlayer);
    if (!targetPlayer) return;
    
    switch (selectedAction) {
      case 'mafia-kill':
        eliminatePlayer(selectedPlayer);
        addToGameLog(`Mafia team chose to eliminate ${targetPlayer.name}.`);
        break;
        
      case 'illusionist-block':
        blockPlayerAbility(selectedPlayer);
        addToGameLog(`Illusionist blocked ${targetPlayer.name}'s ability.`);
        break;
        
      case 'bomber-place-bomb':
        placeBomb(selectedPlayer, bombCode);
        addToGameLog(`Bomber placed a bomb on ${targetPlayer.name} with code ${bombCode}.`);
        break;
        
      case 'zodiac-kill':
        // Only allow Zodiac to kill on even nights
        if (gameState.round % 2 === 0) {
          // Check if target is Protector
          if (targetPlayer.role.name === 'Protector') {
            // Zodiac dies instead
            const zodiacPlayer = gameState.players.find(p => p.role.name === 'Zodiac');
            if (zodiacPlayer) {
              eliminatePlayer(zodiacPlayer.id);
              addToGameLog(`Zodiac tried to kill Protector and died instead!`);
            }
          } else {
            eliminatePlayer(selectedPlayer);
            addToGameLog(`Zodiac killed ${targetPlayer.name}.`);
          }
        } else {
          addToGameLog(`Zodiac can only kill on even nights.`);
        }
        break;
        
      case 'professional-shoot':
        // Check if target is Mafia
        if (targetPlayer.role.team === 'mafia') {
          eliminatePlayer(selectedPlayer);
          addToGameLog(`Professional shot ${targetPlayer.name}, who was Mafia!`);
          
          // Special case for Al Capone
          if (targetPlayer.role.name === 'Al Capone') {
            addToGameLog(`Al Capone was shot by the Professional and eliminated!`);
          }
        } else {
          // If not Mafia, Professional dies instead
          const professionalPlayer = gameState.players.find(p => p.role.name === 'Professional');
          if (professionalPlayer) {
            // Check if Professional has vest
            if (professionalPlayer.hasVest) {
              const updatedPlayers = gameState.players.map(p => 
                p.id === professionalPlayer.id ? { ...p, hasVest: false } : p
              );
              gameState.players = updatedPlayers;
              addToGameLog(`Professional shot a Citizen but was saved by vest!`);
            } else {
              eliminatePlayer(professionalPlayer.id);
              addToGameLog(`Professional shot a Citizen and died!`);
            }
          }
        }
        break;
        
      case 'doctor-save':
        savePlayerRole(selectedPlayer);
        addToGameLog(`Doctor attempted to save ${targetPlayer.name}.`);
        break;
        
      case 'detective-check':
        // Al Capone returns negative result to Detective
        const isNegative = targetPlayer.role.name === 'Al Capone' || targetPlayer.role.team !== 'mafia';
        addToGameLog(`Detective checked ${targetPlayer.name}. Result: ${isNegative ? 'Negative' : 'Positive'}`);
        break;
        
      case 'gunsmith-give-gun':
        // Gunsmith gives a gun (real or fake)
        const isReal = Math.random() > 0.5;
        addToGameLog(`Gunsmith gave ${targetPlayer.name} a ${isReal ? 'real' : 'fake'} gun.`);
        break;
        
      case 'ocean-awaken':
        // Ocean awakens a citizen
        if (targetPlayer.role.team === 'mafia' || targetPlayer.role.name === 'Zodiac') {
          // Ocean dies the next day if awakens Mafia or Zodiac
          addToGameLog(`Ocean awakened ${targetPlayer.name}, who is ${targetPlayer.role.name}. Ocean will die tomorrow.`);
          const oceanPlayer = gameState.players.find(p => p.role.name === 'Ocean');
          if (oceanPlayer) {
            setTimeout(() => {
              eliminatePlayer(oceanPlayer.id);
              addToGameLog(`Ocean died after awakening ${targetPlayer.role.name}.`);
            }, 1000);
          }
        } else {
          addToGameLog(`Ocean successfully awakened ${targetPlayer.name}.`);
        }
        break;
    }
    
    // Reset selections
    setSelectedAction(null);
    setSelectedPlayer(null);
  };
  
  const renderActionSelector = () => {
    const actions = [
      // Mafia team actions
      { id: 'mafia-kill', name: 'Mafia Kill', team: 'mafia' },
      { id: 'illusionist-block', name: 'Illusionist Block', team: 'mafia' },
      { id: 'bomber-place-bomb', name: 'Bomber Place Bomb', team: 'mafia' },
      
      // Independent actions
      { id: 'zodiac-kill', name: 'Zodiac Kill', team: 'independent' },
      
      // Citizen team actions
      { id: 'professional-shoot', name: 'Professional Shoot', team: 'citizen' },
      { id: 'doctor-save', name: 'Doctor Save', team: 'citizen' },
      { id: 'detective-check', name: 'Detective Check', team: 'citizen' },
      { id: 'gunsmith-give-gun', name: 'Gunsmith Give Gun', team: 'citizen' },
      { id: 'ocean-awaken', name: 'Ocean Awaken', team: 'citizen' },
    ];
    
    return (
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Choose Action:</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {actions.map(action => (
            <button
              key={action.id}
              onClick={() => handleActionSelect(action.id)}
              className={`p-2 text-sm rounded-lg transition-colors ${
                selectedAction === action.id 
                  ? action.team === 'mafia' 
                    ? 'bg-red-500 text-white' 
                    : action.team === 'independent' 
                      ? 'bg-purple-500 text-white'
                      : 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {action.name}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  const renderBombCodeSelector = () => {
    if (selectedAction !== 'bomber-place-bomb') return null;
    
    return (
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Bomb Code:</h3>
        <div className="flex space-x-2">
          {[1, 2, 3, 4].map(code => (
            <button
              key={code}
              onClick={() => setBombCode(code)}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                bombCode === code 
                  ? 'bg-red-500 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {code}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  const renderPlayerSelector = () => {
    if (!selectedAction) return null;
    
    return (
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Select Target:</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
          {livingPlayers.map(player => (
            <button
              key={player.id}
              onClick={() => handlePlayerSelect(player.id)}
              className={`p-2 text-sm rounded-lg transition-colors ${
                selectedPlayer === player.id 
                  ? 'bg-green-500 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {player.name}
              {player.isBlocked && ' (Blocked)'}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="fixed bottom-4 right-4 z-10">
      {!showPanel ? (
        <button
          onClick={() => setShowPanel(true)}
          className="px-4 py-2 bg-indigo-600/90 dark:bg-amber-600/90 text-white rounded-lg shadow-lg hover:bg-indigo-500 dark:hover:bg-amber-500 transition-colors"
        >
          Show Night Actions
        </button>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-w-xl w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Night Actions Panel</h2>
            <button
              onClick={() => setShowPanel(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {renderActionSelector()}
          {renderBombCodeSelector()}
          {renderPlayerSelector()}
          
          <div className="mt-4">
            <button
              onClick={performAction}
              disabled={!selectedAction || !selectedPlayer}
              className={`w-full py-2 rounded-lg transition-colors ${
                selectedAction && selectedPlayer
                  ? 'bg-indigo-600 dark:bg-amber-600 text-white hover:bg-indigo-500 dark:hover:bg-amber-500'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              Perform Action
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 