'use client';

import { useState, useEffect } from 'react';
import { useGameContext } from '../context/GameContext';

export default function PoisonVotePanel() {
  const { 
    gameState, 
    eliminatePlayer,
    addToGameLog,
  } = useGameContext();
  
  const [poisonedPlayerId, setPoisonedPlayerId] = useState<string | null>(null);
  const [votes, setVotes] = useState<{[key: string]: 'yes' | 'no'}>({});
  const [votingComplete, setVotingComplete] = useState<boolean>(false);
  const [showResult, setShowResult] = useState<boolean>(false);
  
  // Ensure hooks are called unconditionally
  useEffect(() => {
    // Determine initial poisoned player if applicable
    if (gameState && gameState.scenario === 'capo') {
      // Find the Herbalist - Removing unused variable
      // const herbalist = gameState.players.find(p => p.role.name === 'Herbalist');
      // Check if Herbalist poisoned someone (logic depends on how you track this)
      // For now, we assume we need a way to set poisonedPlayerId initially
      // E.g., if it's stored in the gameState
    }
  }, [gameState]); // Dependency on gameState

  // Only show for Capo scenario with a Herbalist role
  if (!gameState || gameState.scenario !== 'capo') return null;
  
  // Living players excluding Herbalist (assuming Herbalist exists if panel shows)
  const herbalistId = gameState.players.find(p => p.role.name === 'Herbalist')?.id;
  const livingVoters = gameState.players.filter(p => p.isAlive && p.id !== herbalistId);
  const poisonedPlayer = gameState.players.find(p => p.id === poisonedPlayerId);
  
  const handleVote = (voterId: string, vote: 'yes' | 'no') => {
    if (votingComplete) return;
    
    const newVotes = { ...votes, [voterId]: vote };
    setVotes(newVotes);
    
    // Check if all living players have voted
    if (Object.keys(newVotes).length === livingVoters.length) {
      setVotingComplete(true);
    }
  };
  
  const handleAntidoteDecision = () => {
    if (!votingComplete || !poisonedPlayerId) return;
    
    const yesVotes = Object.values(votes).filter(v => v === 'yes').length;
    const noVotes = Object.keys(votes).length - yesVotes;
    
    const majority = Math.floor(livingVoters.length / 2) + 1;
    const giveAntidote = yesVotes >= majority;
    
    const poisonedPlayerDetails = gameState.players.find(p => p.id === poisonedPlayerId);
    
    if (giveAntidote) {
      addToGameLog(`Majority voted YES (${yesVotes} to ${noVotes}). Antidote given to ${poisonedPlayerDetails?.name}.`);
      // Logic to remove poisoned status (depends on implementation)
    } else {
      addToGameLog(`Majority voted NO (${noVotes} to ${yesVotes}). Antidote denied. ${poisonedPlayerDetails?.name} is eliminated.`);
      eliminatePlayer(poisonedPlayerId);
    }
    
    setShowResult(true);
  };

  const handleReset = () => {
    setPoisonedPlayerId(null);
    setVotes({});
    setVotingComplete(false);
    setShowResult(false);
    addToGameLog('Poison state has been reset.');
  };

  const renderContent = () => {
    if (!poisonedPlayerId) {
      // Render UI for Herbalist to select a target to poison (if needed here)
      return (
        <div className="text-center text-gray-500 dark:text-gray-400">
          Herbalist needs to select a player to poison.
        </div>
      );
    }

    if (!votingComplete) {
      // Render Voting Panel Logic
      return (
        <div>
          <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
            Vote on Antidote for {poisonedPlayer?.name}
          </h3>
          <div className="space-y-2 mb-4">
            {livingVoters.map(voter => (
              <div key={voter.id} className="flex justify-between items-center p-2 bg-gray-100 dark:bg-gray-700 rounded">
                <span className="text-gray-800 dark:text-gray-200">{voter.name}</span>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleVote(voter.id, 'yes')}
                    disabled={!!votes[voter.id]}
                    className={`px-2 py-1 text-xs rounded ${votes[voter.id] === 'yes' ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50'}`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleVote(voter.id, 'no')}
                    disabled={!!votes[voter.id]}
                    className={`px-2 py-1 text-xs rounded ${votes[voter.id] === 'no' ? 'bg-red-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 disabled:opacity-50'}`}
                  >
                    No
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (!showResult) {
      // Render Antidote Decision Button
      return (
        <button
          onClick={handleAntidoteDecision}
          className="w-full py-2 bg-indigo-600 dark:bg-amber-600 text-white rounded-lg hover:bg-indigo-500 dark:hover:bg-amber-500"
        >
          Finalize Antidote Decision
        </button>
      );
    }

    // Show result message after decision
    return (
      <div className="p-3 text-center bg-blue-100 dark:bg-blue-900/30 rounded-lg">
        <p className="text-blue-800 dark:text-blue-300 font-medium">
          Voting complete. Check the game log for the outcome.
        </p>
      </div>
    );
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Poison Controls</h2>
        <button
          onClick={() => document.getElementById('poison-panel')?.classList.add('hidden')}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      <div className="mb-4">
        {poisonedPlayer && (
          <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg mb-4">
            <p className="text-red-800 dark:text-red-300 font-medium">
              Currently poisoned: {poisonedPlayer.name}
            </p>
          </div>
        )}
        
        {renderContent()}

      </div>
      
      {poisonedPlayerId && (
        <button
          onClick={handleReset}
          className="w-full py-2 mt-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
        >
          Reset Poison State
        </button>
      )}
    </div>
  );
} 