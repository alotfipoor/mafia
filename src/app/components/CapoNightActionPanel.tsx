'use client';

import { useState } from 'react';
import { Player } from '../models/types';
import { useGameContext } from '../context/GameContext';

export default function CapoNightActionPanel() {
  const { 
    gameState, 
    eliminatePlayer,
    savePlayerRole,
    addToGameLog,
  } = useGameContext();
  
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState<boolean>(false);
  const [roleGuess, setRoleGuess] = useState<string>('');
  const [showPoisonVoting, setShowPoisonVoting] = useState<boolean>(false);
  const [poisonedPlayerId, setPoisonedPlayerId] = useState<string | null>(null);
  const [poisonVotes, setPoisonVotes] = useState<{[key: string]: boolean}>({});

  if (!gameState || gameState.phase !== 'night' || gameState.scenario !== 'capo') return null;
  
  const livingPlayers = gameState.players.filter(p => p.isAlive);
  
  const handleActionSelect = (action: string) => {
    setSelectedAction(action);
    setSelectedPlayer(null);
    setRoleGuess('');
  };
  
  const handlePlayerSelect = (playerId: string) => {
    setSelectedPlayer(playerId);
  };
  
  const handlePoisonVote = (playerId: string, vote: boolean) => {
    setPoisonVotes(prev => ({
      ...prev,
      [playerId]: vote
    }));
  };
  
  const countPoisonVotes = () => {
    const votes = Object.values(poisonVotes);
    const yesVotes = votes.filter(v => v).length;
    return {
      total: votes.length,
      yes: yesVotes
    };
  };
  
  const handleGiveAntidote = (giveAntidote: boolean) => {
    if (!poisonedPlayerId) return;
    
    const poisonedPlayer = gameState.players.find(p => p.id === poisonedPlayerId);
    if (!poisonedPlayer) return;
    
    if (giveAntidote) {
      addToGameLog(`Antidote was given to ${poisonedPlayer.name}, who survived.`);
    } else {
      eliminatePlayer(poisonedPlayerId);
      addToGameLog(`Antidote was denied. ${poisonedPlayer.name} died from the poison.`);
    }
    
    setPoisonedPlayerId(null);
    setShowPoisonVoting(false);
    setPoisonVotes({});
  };
  
  const performAction = () => {
    if (!selectedAction || !selectedPlayer) return;
    
    const targetPlayer = gameState.players.find(p => p.id === selectedPlayer);
    if (!targetPlayer) return;
    
    switch (selectedAction) {
      case 'don-mafia-kill':
        eliminatePlayer(selectedPlayer);
        addToGameLog(`Don Mafia chose to eliminate ${targetPlayer.name}.`);
        break;
        
      case 'don-mafia-antidote':
        // Don Mafia uses antidote on himself (only valid if poisoned)
        addToGameLog(`Don Mafia used antidote on himself.`);
        break;
        
      case 'don-mafia-recruit':
        // Can only recruit Simple Citizen or Suspect
        if (targetPlayer.role.name === 'Simple Citizen' || targetPlayer.role.name === 'Suspect') {
          addToGameLog(`Don Mafia recruited ${targetPlayer.name} to the Mafia team.`);
          // In a real implementation, we would change the player's role
        } else {
          addToGameLog(`Don Mafia tried to recruit ${targetPlayer.name}, but failed (not a Simple Citizen or Suspect).`);
        }
        break;
        
      case 'wizard-redirect':
        // Wizard redirects ability to the player themselves
        const actionText = getWizardActionText(targetPlayer);
        addToGameLog(`Wizard redirected ${targetPlayer.name}'s ability to themselves. ${actionText}`);
        break;
        
      case 'executioner-guess':
        if (!roleGuess) {
          addToGameLog(`Executioner must specify a role guess for ${targetPlayer.name}.`);
          return;
        }
        
        // Check if guess is correct
        if (targetPlayer.role.name.toLowerCase() === roleGuess.toLowerCase()) {
          eliminatePlayer(selectedPlayer);
          addToGameLog(`Executioner correctly guessed ${targetPlayer.name} as ${roleGuess}. ${targetPlayer.name} was eliminated.`);
        } else {
          addToGameLog(`Executioner guessed ${targetPlayer.name} as ${roleGuess}, but was incorrect.`);
        }
        break;
        
      case 'detective-check':
        // Don Mafia always appears negative to Detective
        const isNegative = targetPlayer.role.name === 'Don Mafia' || targetPlayer.role.team !== 'mafia';
        addToGameLog(`Detective checked ${targetPlayer.name}. Result: ${isNegative ? 'Negative' : 'Positive'}`);
        break;
        
      case 'blacksmith-save':
        savePlayerRole(selectedPlayer);
        addToGameLog(`Blacksmith attempted to save ${targetPlayer.name}.`);
        break;
        
      case 'herbalist-poison':
        // Mark player as poisoned
        addToGameLog(`Herbalist poisoned ${targetPlayer.name}.`);
        setPoisonedPlayerId(selectedPlayer);
        break;
        
      case 'herbalist-antidote':
        // Give antidote to a poisoned player
        addToGameLog(`Herbalist gave antidote to ${targetPlayer.name}.`);
        break;
        
      case 'village-chief-link':
        // Link with citizen - we'd need to track linked players in the state
        if (targetPlayer.role.team === 'mafia' && targetPlayer.role.name !== 'Informant') {
          // Village Chief and any linked citizens will be eliminated
          const villageChief = gameState.players.find(p => p.role.name === 'Village Chief');
          if (villageChief) {
            eliminatePlayer(villageChief.id);
            addToGameLog(`Village Chief linked with ${targetPlayer.name}, who is Mafia. Village Chief was eliminated.`);
            // If chief had links, they would be eliminated too
          }
        } else {
          // Success - would record link in real implementation
          addToGameLog(`Village Chief linked with ${targetPlayer.name}.`);
        }
        break;
        
      case 'heir-select':
        // Heir selects a player to inherit from
        addToGameLog(`Heir selected ${targetPlayer.name} to inherit from if eliminated.`);
        break;
    }
    
    // Reset selections
    setSelectedAction(null);
    setSelectedPlayer(null);
    setRoleGuess('');
  };
  
  const getWizardActionText = (targetPlayer: Player): string => {
    switch (targetPlayer.role.name) {
      case 'Blacksmith':
        return 'Blacksmith gives armor to themselves.';
      case 'Detective':
        return 'Detective will receive negative results for any inquiry.';
      case 'Herbalist':
        return 'Herbalist poisons themselves.';
      case 'Village Chief':
        return 'Village Chief loses one of their abilities.';
      default:
        return '';
    }
  };
  
  const renderActionSelector = () => {
    const actions = [
      // Mafia team actions
      { id: 'don-mafia-kill', name: 'Don Mafia Kill', team: 'mafia' },
      { id: 'don-mafia-antidote', name: 'Don Mafia Antidote', team: 'mafia' },
      { id: 'don-mafia-recruit', name: 'Don Mafia Recruit', team: 'mafia' },
      { id: 'wizard-redirect', name: 'Wizard Redirect', team: 'mafia' },
      { id: 'executioner-guess', name: 'Executioner Guess', team: 'mafia' },
      
      // Citizen team actions
      { id: 'detective-check', name: 'Detective Check', team: 'citizen' },
      { id: 'blacksmith-save', name: 'Blacksmith Save', team: 'citizen' },
      { id: 'herbalist-poison', name: 'Herbalist Poison', team: 'citizen' },
      { id: 'herbalist-antidote', name: 'Herbalist Antidote', team: 'citizen' },
      { id: 'village-chief-link', name: 'Village Chief Link', team: 'citizen' },
      { id: 'heir-select', name: 'Heir Select', team: 'citizen' },
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
  
  const renderRoleGuessInput = () => {
    if (selectedAction !== 'executioner-guess' || !selectedPlayer) return null;
    
    return (
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">Guess Role:</h3>
        <select
          value={roleGuess}
          onChange={(e) => setRoleGuess(e.target.value)}
          className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
        >
          <option value="">Select a role...</option>
          <option value="Don Mafia">Don Mafia</option>
          <option value="Wizard">Wizard</option>
          <option value="Executioner">Executioner</option>
          <option value="Informant">Informant</option>
          <option value="Detective">Detective</option>
          <option value="Suspect">Suspect</option>
          <option value="Blacksmith">Blacksmith</option>
          <option value="Herbalist">Herbalist</option>
          <option value="Heir">Heir</option>
          <option value="Village Chief">Village Chief</option>
          <option value="Simple Citizen">Simple Citizen</option>
        </select>
      </div>
    );
  };
  
  const renderPoisonVoting = () => {
    if (!showPoisonVoting || !poisonedPlayerId) return null;
    
    const poisonedPlayer = gameState.players.find(p => p.id === poisonedPlayerId);
    if (!poisonedPlayer) return null;
    
    const { total, yes } = countPoisonVotes();
    const majority = Math.floor(livingPlayers.length / 2) + 1;
    const majorityReached = yes >= majority;
    
    return (
      <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 rounded-lg">
        <h3 className="text-lg font-semibold mb-2 text-red-800 dark:text-red-300">
          {poisonedPlayer.name} is Poisoned
        </h3>
        
        <p className="mb-4 text-gray-700 dark:text-gray-300">
          Vote whether to give antidote (majority needed: {majority})
        </p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {livingPlayers
            .filter(p => p.id !== poisonedPlayerId) // Poisoned player can't vote
            .map(player => (
              <div key={player.id} className="flex items-center space-x-2 p-2 bg-white dark:bg-gray-800 rounded-lg">
                <span className="text-sm">{player.name}</span>
                <div className="flex space-x-1 ml-auto">
                  <button
                    onClick={() => handlePoisonVote(player.id, true)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      poisonVotes[player.id] === true 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    ✓
                  </button>
                  <button
                    onClick={() => handlePoisonVote(player.id, false)}
                    className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      poisonVotes[player.id] === false 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    ✗
                  </button>
                </div>
              </div>
            ))}
        </div>
        
        <div className="flex justify-between items-center">
          <div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Votes: {yes} Yes / {total} Total
            </span>
          </div>
          
          {majorityReached && (
            <div className="flex space-x-2">
              <button
                onClick={() => handleGiveAntidote(true)}
                className="px-4 py-2 bg-green-600 text-white rounded-lg"
              >
                Give Antidote
              </button>
              <button
                onClick={() => handleGiveAntidote(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Deny Antidote
              </button>
            </div>
          )}
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
      </div>
    );
  };

  const renderPoisonControls = () => {
    if (!poisonedPlayerId) return null;
    
    return (
      <div className="mb-4">
        <button
          onClick={() => setShowPoisonVoting(true)}
          className="w-full py-2 bg-red-600 text-white rounded-lg"
        >
          Start Antidote Voting
        </button>
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
          Show Capo Actions
        </button>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-w-xl w-full">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Capo Night Actions</h2>
            <button
              onClick={() => setShowPanel(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {renderPoisonVoting()}
          {renderPoisonControls()}
          {renderActionSelector()}
          {renderPlayerInfo()}
          {renderPlayerSelector()}
          {renderRoleGuessInput()}
          
          <div className="mt-4">
            <button
              onClick={performAction}
              disabled={!selectedAction || !selectedPlayer || (selectedAction === 'executioner-guess' && !roleGuess)}
              className={`w-full py-2 rounded-lg transition-colors ${
                selectedAction && selectedPlayer && (selectedAction !== 'executioner-guess' || roleGuess)
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