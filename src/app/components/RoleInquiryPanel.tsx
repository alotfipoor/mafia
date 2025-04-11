'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useGameContext } from '../context/GameContext';

export default function RoleInquiryPanel() {
  const { gameState, checkPlayerRole, revealPlayerRole, addToGameLog } = useGameContext();
  
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Effect to handle the visibility toggle from the mobile menu
  useEffect(() => {
    const panelContainer = document.getElementById('role-check-panel-container');
    
    const handleVisibilityChange = () => {
      if (panelContainer) {
        setShowPanel(!panelContainer.classList.contains('hidden'));
      }
    };

    // Initial check
    handleVisibilityChange();
    
    // Add event listener for class changes
    if (panelContainer) {
      const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
          if (mutation.attributeName === 'class') {
            handleVisibilityChange();
          }
        });
      });
      
      observer.observe(panelContainer, { attributes: true });
      
      return () => observer.disconnect();
    }
  }, []);
  
  // Handle panel close - also update the hidden class for mobile menu toggling
  const handleClosePanel = () => {
    setShowPanel(false);
    const panelContainer = document.getElementById('role-check-panel-container');
    if (panelContainer) {
      panelContainer.classList.add('hidden');
    }
  };
  
  // Only show for Zodiac scenario with inquiries remaining
  if (!gameState || 
      gameState.scenario !== 'zodiac' || 
      !gameState.zodiacScenario || 
      gameState.zodiacScenario.roleInquiriesLeft <= 0) {
    return null;
  }
  
  const eliminatedPlayers = gameState.players.filter(p => !p.isAlive && !p.isRevealed);
  
  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayer(playerId);
  };
  
  const handleRoleInquiry = () => {
    if (!selectedPlayer) return;
    
    const player = gameState.players.find(p => p.id === selectedPlayer);
    if (!player) return;
    
    // Reveal the player's role
    revealPlayerRole(selectedPlayer);
    
    // Decrease the number of inquiries left
    checkPlayerRole();
    
    addToGameLog(`${player.name}'s role (${player.role.name}) was revealed by role check. ${gameState.zodiacScenario!.roleInquiriesLeft - 1} checks remaining.`);
    
    // Close panel after action
    handleClosePanel();
    setSelectedPlayer(null);
  };
  
  const panelContent = (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-purple-300 dark:border-purple-800 max-w-sm w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-purple-600 dark:text-purple-400">Check Eliminated Roles</h2>
        <button
          onClick={handleClosePanel}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="mb-4">
        <p className="text-gray-600 dark:text-gray-300 mb-2">
          You have {gameState.zodiacScenario.roleInquiriesLeft} role checks left. 
          Select an eliminated player to reveal their role.
        </p>
        
        {eliminatedPlayers.length === 0 ? (
          <p className="text-amber-600 dark:text-amber-400 text-center italic mt-4">
            No eligible players to check
          </p>
        ) : (
          <div className="mt-4">
            <h3 className="text-md font-semibold mb-2 text-gray-800 dark:text-gray-200">Select Player:</h3>
            <div className="grid grid-cols-2 gap-2">
              {eliminatedPlayers.map(player => (
                <button
                  key={player.id}
                  onClick={() => handlePlayerSelect(player.id)}
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
          </div>
        )}
      </div>
      
      <div className="mt-4">
        <button
          onClick={handleRoleInquiry}
          disabled={!selectedPlayer}
          className={`w-full py-2 rounded-lg transition-colors ${
            selectedPlayer
              ? 'bg-purple-600 text-white hover:bg-purple-500'
              : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
          }`}
        >
          Reveal Role
        </button>
      </div>
    </div>
  );
  
  return (
    <>
      {/* Panel for desktop view (fixed position) */}
      <div className="fixed top-4 right-4 z-10 md:block hidden">
        {!showPanel ? (
          <button
            onClick={() => setShowPanel(true)}
            className="px-4 py-2 bg-purple-600/90 text-white rounded-lg shadow-lg hover:bg-purple-500 transition-colors"
          >
            Check Roles ({gameState.zodiacScenario.roleInquiriesLeft})
          </button>
        ) : (
          panelContent
        )}
      </div>
      
      {/* Mobile panel portal: Render content into the container div in GameBoard if the panel should be shown */}
      {isMounted && showPanel && document.getElementById('role-check-panel-container')
        ? createPortal(
            panelContent, // Re-use the same content for mobile
            document.getElementById('role-check-panel-container')!
          )
        : null}
    </>
  );
} 