'use client';

import { useState, useEffect } from 'react';
import { useGameContext } from '../context/GameContext';

export default function PoisonVotePanel() {
  const { 
    gameState, 
    eliminatePlayer,
    addToGameLog
  } = useGameContext();
  
  const [showPanel, setShowPanel] = useState<boolean>(false);
  const [poisonedPlayerId, setPoisonedPlayerId] = useState<string | null>(null);
  const [votes, setVotes] = useState<{[playerId: string]: 'yes' | 'no' | null}>({});
  const [votingComplete, setVotingComplete] = useState<boolean>(false);
  const [showResult, setShowResult] = useState<boolean>(false);
  
  // Only show for Capo scenario with a poisoned player
  if (!gameState || gameState.scenario !== 'capo') return null;
  
  // For demo purposes, we'll check for any player that could be poisoned
  // In a real implementation, we should track the poisoned state in gameState
  const livingPlayers = gameState.players.filter(p => p.isAlive);
  
  // Initialize the poisoned player for demo purposes
  // In a real implementation, this would come from the game state
  useEffect(() => {
    if (livingPlayers.length > 0 && !poisonedPlayerId) {
      // For demo, we're just setting the first player as poisoned
      // In a real implementation, the Herbalist would choose
    }
  }, [livingPlayers, poisonedPlayerId]);
  
  const handleSetPoisonedPlayer = (playerId: string) => {
    setPoisonedPlayerId(playerId);
    addToGameLog(`Herbalist poisoned a player. The poison will take effect after this day phase.`);
    setShowPanel(false);
  };
  
  const handleVote = (voterId: string, vote: 'yes' | 'no') => {
    setVotes(prev => ({
      ...prev,
      [voterId]: vote
    }));
  };
  
  const countVotes = () => {
    const yesVotes = Object.values(votes).filter(vote => vote === 'yes').length;
    const totalVoters = livingPlayers.length - 1; // Excluding poisoned player
    return {
      yes: yesVotes,
      no: totalVoters - yesVotes,
      total: totalVoters,
      majority: Math.floor(totalVoters / 2) + 1
    };
  };
  
  const finalizeVoting = () => {
    setVotingComplete(true);
    
    const { yes, majority } = countVotes();
    const majorityReached = yes >= majority;
    
    if (majorityReached) {
      addToGameLog(`The town voted to administer the antidote. The Herbalist must now decide.`);
    } else {
      addToGameLog(`The town voted against administering the antidote.`);
    }
    
    setShowResult(true);
  };
  
  const handleAntidoteDecision = (giveAntidote: boolean) => {
    if (!poisonedPlayerId) return;
    
    const poisonedPlayer = gameState.players.find(p => p.id === poisonedPlayerId);
    if (!poisonedPlayer) return;
    
    if (giveAntidote) {
      addToGameLog(`The Herbalist gave the antidote to ${poisonedPlayer.name}, who survived.`);
    } else {
      eliminatePlayer(poisonedPlayerId);
      addToGameLog(`The Herbalist denied the antidote. ${poisonedPlayer.name} died from poison.`);
    }
    
    // Reset the panel state
    setPoisonedPlayerId(null);
    setVotes({});
    setVotingComplete(false);
    setShowResult(false);
    setShowPanel(false);
  };
  
  const renderPoisonTargetSelector = () => {
    if (poisonedPlayerId) return null;
    
    return (
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">
          Select Target to Poison
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {livingPlayers.map(player => (
            <button
              key={player.id}
              onClick={() => handleSetPoisonedPlayer(player.id)}
              className="p-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
            >
              {player.name}
            </button>
          ))}
        </div>
      </div>
    );
  };
  
  const renderVotingPanel = () => {
    if (!poisonedPlayerId || votingComplete) return null;
    
    const poisonedPlayer = gameState.players.find(p => p.id === poisonedPlayerId);
    if (!poisonedPlayer) return null;
    
    const { yes, no, total, majority } = countVotes();
    
    return (
      <div className="mb-4">
        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg mb-4">
          <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-1">
            {poisonedPlayer.name} is Poisoned
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            Vote whether to give the antidote. Majority ({majority} votes) needed.
          </p>
        </div>
        
        <div className="grid grid-cols-1 gap-2 mb-4">
          {livingPlayers
            .filter(p => p.id !== poisonedPlayerId)
            .map(player => (
              <div 
                key={player.id}
                className="flex items-center p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm"
              >
                <span className="font-medium">{player.name}</span>
                <div className="ml-auto flex space-x-2">
                  <button
                    onClick={() => handleVote(player.id, 'yes')}
                    className={`px-3 py-1 rounded-lg ${
                      votes[player.id] === 'yes' 
                        ? 'bg-green-500 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleVote(player.id, 'no')}
                    className={`px-3 py-1 rounded-lg ${
                      votes[player.id] === 'no' 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            ))}
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Yes: {yes} | No: {no} | Total: {total}
          </div>
          <div>
            <button
              onClick={finalizeVoting}
              disabled={Object.keys(votes).length < total}
              className={`px-4 py-2 rounded-lg ${
                Object.keys(votes).length === total
                  ? 'bg-indigo-600 dark:bg-amber-600 text-white'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              Complete Voting
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  const renderAntidoteDecision = () => {
    if (!poisonedPlayerId || !votingComplete || !showResult) return null;
    
    const poisonedPlayer = gameState.players.find(p => p.id === poisonedPlayerId);
    if (!poisonedPlayer) return null;
    
    const { yes, majority } = countVotes();
    const majorityReached = yes >= majority;
    
    if (!majorityReached) {
      handleAntidoteDecision(false); // Automatically deny if majority not reached
      return null;
    }
    
    return (
      <div className="mb-4">
        <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg mb-4">
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
            Herbalist's Decision
          </h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            The town voted to give the antidote to {poisonedPlayer.name}.
            As the Herbalist, you make the final decision.
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={() => handleAntidoteDecision(true)}
            className="flex-1 py-3 bg-green-600 text-white rounded-lg"
          >
            Give Antidote
          </button>
          <button
            onClick={() => handleAntidoteDecision(false)}
            className="flex-1 py-3 bg-red-600 text-white rounded-lg"
          >
            Deny Antidote
          </button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="w-full">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-200">Poison Controls</h2>
      
      {/* Content of Poison Vote Panel */}
      <div className="mb-4">
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
          Herbalist has poisoned a player. The village must vote whether to administer the antidote.
        </p>
        
        {/* Poisoned player information */}
        <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-lg mb-4">
          <p className="text-red-800 dark:text-red-300 font-medium">
            Current poisoned player: {poisonedPlayerId ? gameState.players.find(p => p.id === poisonedPlayerId)?.name : 'None'}
          </p>
        </div>
        
        {/* Voting controls */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button className="py-2 bg-green-600 text-white rounded-lg hover:bg-green-500">
            Give Antidote
          </button>
          <button className="py-2 bg-red-600 text-white rounded-lg hover:bg-red-500">
            Deny Antidote
          </button>
        </div>
      </div>
      
      <button
        className="w-full py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
        onClick={() => {
          // Close panel
          document.getElementById('poison-panel')?.classList.add('hidden');
        }}
      >
        Close
      </button>
    </div>
  );
} 