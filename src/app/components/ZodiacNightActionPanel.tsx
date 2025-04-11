'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useGameContext } from '../context/GameContext';

interface ZodiacNightActionPanelProps {
  isMobileVisible: boolean;
  closeMobilePanel: () => void;
}

export default function ZodiacNightActionPanel({ isMobileVisible, closeMobilePanel }: ZodiacNightActionPanelProps) {
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
  const [showDesktopPanel, setShowDesktopPanel] = useState<boolean>(false);
  const [bombCode, setBombCode] = useState<number>(Math.floor(Math.random() * 10000));
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // Effect to handle the visibility toggle from the mobile menu
  useEffect(() => {
    const panelContainer = document.getElementById('zodiac-night-actions-panel-container');
    
    const handleVisibilityChange = () => {
      if (panelContainer) {
        setShowDesktopPanel(!panelContainer.classList.contains('hidden'));
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
  
  // Use the prop for mobile visibility
  const showMobilePanel = isMobileVisible;

  // Handle closing desktop panel
  const handleCloseDesktopPanel = () => {
    setShowDesktopPanel(false);
  };
  
  // Use the passed function to close the mobile panel
  const handleCloseMobilePanel = () => {
    closeMobilePanel();
  };
  
  if (!gameState || gameState.phase !== 'night' || gameState.scenario !== 'zodiac') return null;
  
  const livingPlayers = gameState.players.filter(p => p.isAlive);
  
  const handleActionSelect = (action: string) => {
    setSelectedAction(action);
    setSelectedPlayer(null);
    
    // Generate a new random 4-digit code when placing a bomb
    if (action === 'bomber-plant') {
      setBombCode(Math.floor(Math.random() * 10000));
    }
  };
  
  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayer(playerId);
  };
  
  const performAction = () => {
    if (!selectedAction || !selectedPlayer) return;
    
    const targetPlayer = gameState.players.find(p => p.id === selectedPlayer);
    if (!targetPlayer) return;
    
    switch (selectedAction) {
      // Zodiac team actions
      case 'zodiac-kill':
        eliminatePlayer(selectedPlayer);
        addToGameLog(`Zodiac killed ${targetPlayer.name}.`);
        break;
        
      case 'bodyguard-protect':
        savePlayerRole(selectedPlayer);
        addToGameLog(`Bodyguard protected ${targetPlayer.name}.`);
        break;
        
      case 'detective-check':
        // Simulate detective's check - in a real implementation, you'd show the role info
        const targetRole = targetPlayer.role.name;
        const targetTeam = targetPlayer.role.team;
        addToGameLog(`Detective checked ${targetPlayer.name}: Role is ${targetRole} (${targetTeam} team).`);
        break;
        
      case 'fortune-teller-read':
        // Fortune teller can peek at other players' roles
        addToGameLog(`Fortune Teller reads ${targetPlayer.name}'s fate.`);
        checkPlayerRole();
        break;
        
      case 'bomber-plant':
        // Plant a bomb with a random code
        placeBomb(selectedPlayer, bombCode);
        addToGameLog(`Bomber planted a bomb on ${targetPlayer.name} with code ${bombCode}.`);
        break;
        
      case 'psychic-block':
        // Block someone's ability
        blockPlayerAbility(selectedPlayer);
        addToGameLog(`Psychic blocked ${targetPlayer.name}'s ability.`);
        break;
        
      case 'mafia-kill':
        eliminatePlayer(selectedPlayer);
        addToGameLog(`Mafia killed ${targetPlayer.name}.`);
        break;
        
      default:
        addToGameLog(`Unknown action ${selectedAction} performed on ${targetPlayer.name}.`);
        break;
    }
    
    // Reset selections after performing action
    setSelectedAction(null);
    setSelectedPlayer(null);
    
    // Close panel after action
    handleCloseDesktopPanel();
  };
  
  const renderActionSelector = () => {
    const actions = [
      // Zodiac team actions
      { id: 'zodiac-kill', name: 'Zodiac Kill', team: 'zodiac' },
      { id: 'psychic-block', name: 'Psychic Block Ability', team: 'zodiac' },
      { id: 'bomber-plant', name: 'Plant Bomb', team: 'zodiac' },
      
      // Citizen team actions
      { id: 'bodyguard-protect', name: 'Bodyguard Protect', team: 'citizen' },
      { id: 'detective-check', name: 'Detective Check', team: 'citizen' },
      { id: 'fortune-teller-read', name: 'Fortune Teller Read', team: 'citizen' },
      
      // Mafia action
      { id: 'mafia-kill', name: 'Mafia Kill', team: 'mafia' },
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
                  ? action.team === 'zodiac' 
                    ? 'bg-purple-500 text-white' 
                    : action.team === 'mafia'
                      ? 'bg-red-500 text-white'
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
              {player.isRevealed && ` (${player.role.name})`}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  const renderPlayerInfo = () => {
    if (!selectedPlayer) return null;
    
    const player = gameState.players.find(p => p.id === selectedPlayer);
    if (!player) return null;
    
    return (
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <h3 className="text-lg font-semibold mb-1 text-gray-800 dark:text-gray-200">{player.name}</h3>
        {player.isRevealed ? (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Role: {player.role.name}</p>
            <p className="text-sm text-gray-600 dark:text-gray-300">Team: {player.role.team}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-300">Role not revealed</p>
        )}
        {player.isBlocked && (
          <p className="text-sm text-red-500">Ability blocked</p>
        )}
        {player.hasBomb && (
          <p className="text-sm text-red-500">Has an active bomb</p>
        )}
      </div>
    );
  };
  
  const panelContent = (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-w-xl w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Zodiac Night Actions</h2>
        <button
          onClick={showDesktopPanel ? handleCloseDesktopPanel : handleCloseMobilePanel}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {renderActionSelector()}
      {renderPlayerInfo()}
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
  );
  
  // Define mobile panel content separately
  const mobilePanelContent = (
    <>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Zodiac Actions</h2>
        <button
          onClick={handleCloseMobilePanel}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {renderActionSelector()}
      {renderPlayerInfo()}
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
    </>
  );

  return (
    <>
      {/* Panel for desktop view (fixed position) */}
      <div className="fixed bottom-4 right-4 z-10 hidden md:block">
        {!showDesktopPanel ? (
          <button
            onClick={() => setShowDesktopPanel(true)}
            className="px-4 py-2 bg-indigo-600/90 dark:bg-amber-600/90 text-white rounded-lg shadow-lg hover:bg-indigo-500 dark:hover:bg-amber-500 transition-colors"
          >
            Show Runner Actions
          </button>
        ) : (
          panelContent
        )}
      </div>
      
      {/* Mobile panel portal: Render content into the container div in GameBoard if the panel should be shown */}
      {isMounted && showMobilePanel && document.getElementById('zodiac-night-actions-panel-container')
        ? createPortal(
            mobilePanelContent,
            document.getElementById('zodiac-night-actions-panel-container')!
          )
        : null}
    </>
  );
} 