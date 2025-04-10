'use client';

import { useState } from 'react';
import { useGameContext } from '../context/GameContext';

export default function VillageChiefPanel() {
  const { 
    gameState, 
    eliminatePlayer,
    addToGameLog
  } = useGameContext();
  
  const [linkedPlayers, setLinkedPlayers] = useState<string[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  
  // Only show for Capo scenario with a Village Chief role
  if (!gameState || gameState.scenario !== 'capo') return null;
  
  // Check if Village Chief is alive in the game
  const villageChief = gameState.players.find(p => p.isAlive && p.role.name === 'Village Chief');
  if (!villageChief) return null;
  
  const livingPlayers = gameState.players.filter(p => p.isAlive && p.id !== villageChief.id);
  
  const handleSelectPlayer = (playerId: string) => {
    setSelectedPlayer(playerId);
  };
  
  const handleLinkPlayer = () => {
    if (!selectedPlayer) return;
    
    // Check if we can still add links (max 2)
    if (linkedPlayers.length >= 2) {
      addToGameLog(`Village Chief can only link with 2 citizens.`);
      return;
    }
    
    // Check if player is already linked
    if (linkedPlayers.includes(selectedPlayer)) {
      addToGameLog(`This player is already linked with Village Chief.`);
      return;
    }
    
    const targetPlayer = gameState.players.find(p => p.id === selectedPlayer);
    if (!targetPlayer) return;
    
    // Check if player is Mafia (except Informant)
    if (targetPlayer.role.team === 'mafia' && targetPlayer.role.name !== 'Informant') {
      // Village Chief and any linked citizens are eliminated
      eliminatePlayer(villageChief.id);
      addToGameLog(`Village Chief linked with ${targetPlayer.name}, who is Mafia. Village Chief was eliminated.`);
      
      // Eliminate all linked citizens as well
      linkedPlayers.forEach(linkedId => {
        const linkedPlayer = gameState.players.find(p => p.id === linkedId);
        if (linkedPlayer && linkedPlayer.isAlive) {
          eliminatePlayer(linkedId);
          addToGameLog(`${linkedPlayer.name}, linked with Village Chief, was also eliminated.`);
        }
      });
      
      // Reset linked players as they're all eliminated
      setLinkedPlayers([]);
    } else {
      // Successful link
      const newLinkedPlayers = [...linkedPlayers, selectedPlayer];
      setLinkedPlayers(newLinkedPlayers);
      addToGameLog(`Village Chief linked with ${targetPlayer.name}.`);
    }
    
    setSelectedPlayer(null);
  };
  
  const handleUnlinkPlayer = (playerId: string) => {
    const updatedLinks = linkedPlayers.filter(id => id !== playerId);
    setLinkedPlayers(updatedLinks);
    
    const unlinkPlayer = gameState.players.find(p => p.id === playerId);
    if (unlinkPlayer) {
      addToGameLog(`Village Chief unlinked from ${unlinkPlayer.name}.`);
    }
  };
  
  const renderLinkedPlayers = () => {
    if (linkedPlayers.length === 0) {
      return (
        <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 italic text-center">
            No linked citizens yet
          </p>
        </div>
      );
    }
    
    return (
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
          Linked Citizens
        </h3>
        <div className="space-y-2">
          {linkedPlayers.map(linkedId => {
            const player = gameState.players.find(p => p.id === linkedId);
            if (!player) return null;
            
            return (
              <div 
                key={linkedId} 
                className="flex items-center p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg"
              >
                <span className="font-medium text-purple-800 dark:text-purple-300">
                  {player.name}
                </span>
                <button
                  onClick={() => handleUnlinkPlayer(linkedId)}
                  className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  const renderPlayerSelector = () => {
    if (linkedPlayers.length >= 2) return null;
    
    return (
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
          Select Player to Link
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {livingPlayers
            .filter(p => !linkedPlayers.includes(p.id))
            .map(player => (
              <button
                key={player.id}
                onClick={() => handleSelectPlayer(player.id)}
                className={`p-2 text-sm rounded-lg transition-colors ${
                  selectedPlayer === player.id 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {player.name}
              </button>
            ))}
        </div>
        
        <button
          onClick={handleLinkPlayer}
          disabled={!selectedPlayer}
          className={`w-full py-2 rounded-lg transition-colors ${
            selectedPlayer
              ? 'bg-indigo-600 dark:bg-amber-600 text-white hover:bg-indigo-500 dark:hover:bg-amber-500'
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
        >
          Link Citizen
        </button>
      </div>
    );
  };
  
  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Village Chief Links</h2>
      
      <div className="mb-4">
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
          Select citizens to link with the Village Chief. If the Village Chief links with a Mafia member, they will be eliminated.
        </p>
        
        {renderLinkedPlayers()}
        {renderPlayerSelector()}
      </div>
      
      <div className="flex space-x-2">
        <button 
          className="flex-1 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500"
        >
          Create Link
        </button>
        <button
          className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
          onClick={() => {
            // Close panel
            document.getElementById('village-chief-panel')?.classList.add('hidden');
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
} 