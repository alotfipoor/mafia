'use client';

import { useState } from 'react';
import { useGameContext } from '../context/GameContext';
import PlayerTimer from './PlayerTimer';

export default function CapoTrusteePanel() {
  const { 
    gameState, 
    eliminatePlayer,
    addToGameLog,
    advancePhase
  } = useGameContext();
  
  const [showPanel, setShowPanel] = useState<boolean>(false);
  const [selectedTrustee, setSelectedTrustee] = useState<string | null>(null);
  const [trusteeConfirmed, setTrusteeConfirmed] = useState<boolean>(false);
  const [selectedTargets, setSelectedTargets] = useState<string[]>([]);
  const [firstBulletType, setFirstBulletType] = useState<'blank' | 'real' | null>(null);
  const [timerDuration, setTimerDuration] = useState<40 | 60 | 90>(60);
  const [showTimer, setShowTimer] = useState<boolean>(false);
  const [activePlayer, setActivePlayer] = useState<string>('');
  
  // Only show for Capo scenario on day 1
  if (!gameState || gameState.scenario !== 'capo' || gameState.phase !== 'day' || gameState.round !== 1) {
    return null;
  }
  
  const livingPlayers = gameState.players.filter(p => p.isAlive);
  
  const handleTrusteeSelect = (playerId: string) => {
    if (trusteeConfirmed) return;
    setSelectedTrustee(playerId);
  };
  
  const confirmTrustee = () => {
    if (!selectedTrustee) return;
    
    const trustee = gameState.players.find(p => p.id === selectedTrustee);
    if (!trustee) return;
    
    setTrusteeConfirmed(true);
    addToGameLog(`${trustee.name} was selected as City Trustee.`);
    
    // Start trustee timer
    setActivePlayer(trustee.name);
    setShowTimer(true);
  };
  
  const handleTargetSelect = (playerId: string) => {
    if (!trusteeConfirmed || selectedTargets.includes(playerId) || selectedTargets.length >= 2) return;
    
    const newTargets = [...selectedTargets, playerId];
    setSelectedTargets(newTargets);
    
    const targetPlayer = gameState.players.find(p => p.id === playerId);
    if (targetPlayer) {
      addToGameLog(`${targetPlayer.name} was selected as target ${newTargets.length} by the City Trustee.`);
    }
  };
  
  const handleBulletDecision = (bulletType: 'blank' | 'real') => {
    if (selectedTargets.length !== 2) return;
    
    setFirstBulletType(bulletType);
    
    const secondBulletType = bulletType === 'blank' ? 'real' : 'blank';
    addToGameLog(`Mafia decided: First bullet is ${bulletType}, second bullet is ${secondBulletType}.`);
  };
  
  const fireShot = (targetIndex: number) => {
    if (!firstBulletType || selectedTargets.length < 2) return;
    
    const targetId = selectedTargets[targetIndex];
    const targetPlayer = gameState.players.find(p => p.id === targetId);
    if (!targetPlayer) return;
    
    // Check if this is a real bullet
    const isRealBullet = (targetIndex === 0 && firstBulletType === 'real') || 
                          (targetIndex === 1 && firstBulletType === 'blank');
    
    if (isRealBullet) {
      eliminatePlayer(targetId);
      addToGameLog(`City Trustee fired a real bullet at ${targetPlayer.name}, who was eliminated.`);
      
      // Special case for Don Mafia
      if (targetPlayer.role.name === 'Don Mafia') {
        addToGameLog(`Don Mafia was eliminated by gun on day one. The antidote is transferred to the Wizard.`);
      }
    } else {
      addToGameLog(`City Trustee fired a blank bullet at ${targetPlayer.name}.`);
    }
    
    resetPanel();
    advancePhase(); // Move to night phase
  };
  
  const resetPanel = () => {
    setSelectedTrustee(null);
    setTrusteeConfirmed(false);
    setSelectedTargets([]);
    setFirstBulletType(null);
    setShowTimer(false);
    setShowPanel(false);
  };
  
  return (
    <>
      <PlayerTimer 
        duration={timerDuration} 
        isActive={showTimer} 
        playerName={activePlayer}
        onComplete={() => setShowTimer(false)}
      />
      
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-20">
        {!showPanel ? (
          <button
            onClick={() => setShowPanel(true)}
            className="px-4 py-2 bg-indigo-600/90 dark:bg-amber-600/90 text-white rounded-lg shadow-lg hover:bg-indigo-500 dark:hover:bg-amber-500 transition-colors"
          >
            Capo Trustee Panel
          </button>
        ) : (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 max-w-xl w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Capo Trustee Panel</h2>
              <button
                onClick={() => setShowPanel(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Timer Controls */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Timer Settings</h3>
              <div className="flex space-x-2 mb-2">
                {[40, 60, 90].map((duration) => (
                  <button 
                    key={duration}
                    onClick={() => setTimerDuration(duration as 40 | 60 | 90)}
                    className={`flex-1 px-4 py-2 rounded-lg ${
                      timerDuration === duration 
                        ? 'bg-indigo-600 dark:bg-amber-600 text-white' 
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                    }`}
                  >
                    {duration}s
                  </button>
                ))}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setShowTimer(true);
                    setActivePlayer('Current Speaker');
                  }}
                  className="flex-1 py-2 bg-green-600 text-white rounded-lg"
                >
                  Start Timer
                </button>
                <button
                  onClick={() => setShowTimer(false)}
                  className="flex-1 py-2 bg-red-600 text-white rounded-lg"
                >
                  Stop Timer
                </button>
              </div>
            </div>
            
            {/* Trustee Selection */}
            {!trusteeConfirmed && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Select City Trustee</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                  {livingPlayers.map(player => (
                    <button
                      key={player.id}
                      onClick={() => handleTrusteeSelect(player.id)}
                      className={`p-2 text-sm rounded-lg ${
                        selectedTrustee === player.id 
                          ? 'bg-purple-500 text-white' 
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {player.name}
                    </button>
                  ))}
                </div>
                <button
                  onClick={confirmTrustee}
                  disabled={!selectedTrustee}
                  className={`w-full py-2 rounded-lg ${
                    selectedTrustee
                      ? 'bg-indigo-600 dark:bg-amber-600 text-white' 
                      : 'bg-gray-300 dark:bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  Confirm Trustee
                </button>
              </div>
            )}
            
            {/* Target Selection */}
            {trusteeConfirmed && selectedTargets.length < 2 && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">
                  Select Target {selectedTargets.length + 1}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {livingPlayers
                    .filter(p => p.id !== selectedTrustee && !selectedTargets.includes(p.id))
                    .map(player => (
                      <button
                        key={player.id}
                        onClick={() => handleTargetSelect(player.id)}
                        className="p-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg"
                      >
                        {player.name}
                      </button>
                    ))}
                </div>
              </div>
            )}
            
            {/* Bullet Decision */}
            {trusteeConfirmed && selectedTargets.length === 2 && !firstBulletType && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">
                  Mafia Decision: First Bullet
                </h3>
                <div className="flex space-x-4">
                  <button
                    onClick={() => handleBulletDecision('real')}
                    className="flex-1 py-3 bg-red-600 text-white rounded-lg"
                  >
                    REAL
                  </button>
                  <button
                    onClick={() => handleBulletDecision('blank')}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-lg"
                  >
                    BLANK
                  </button>
                </div>
              </div>
            )}
            
            {/* Shot Controls */}
            {trusteeConfirmed && selectedTargets.length === 2 && firstBulletType && (
              <div className="mb-4">
                <h3 className="text-lg font-semibold mb-2">Fire Shots</h3>
                <div className="space-y-2">
                  {selectedTargets.map((targetId, index) => {
                    const target = gameState.players.find(p => p.id === targetId);
                    if (!target) return null;
                    
                    // Only show second target if first bullet is blank
                    if (index === 1 && firstBulletType === 'real') return null;
                    
                    return (
                      <button
                        key={targetId}
                        onClick={() => fireShot(index)}
                        className="w-full py-2 bg-red-600 text-white rounded-lg"
                      >
                        Shoot {target.name} ({index === 0 ? 'First' : 'Second'} Shot)
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            
            <button
              onClick={resetPanel}
              className="w-full py-2 mt-4 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
            >
              Reset Panel
            </button>
          </div>
        )}
      </div>
    </>
  );
} 