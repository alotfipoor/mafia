'use client';

import { useEffect, useState } from 'react';
import { Player, GameState } from '../models/types';
import { useGameContext } from '../context/GameContext';

export default function GameBoard() {
  const { 
    gameState, 
    advancePhase,
    eliminatePlayer,
    savePlayerRole,
    revealPlayerRole,
    addToGameLog,
    resetGame
  } = useGameContext();
  
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [showLog, setShowLog] = useState<boolean>(false);
  const [cityTrustee, setCityTrustee] = useState<string | null>(null);
  const [capoTargets, setCapoTargets] = useState<string[]>([]);
  const [showCapoControls, setShowCapoControls] = useState<boolean>(false);
  const [firstBullet, setFirstBullet] = useState<'blank' | 'live' | null>(null);
  
  // Reset selected player when phase changes
  useEffect(() => {
    setSelectedPlayer(null);
    
    // Set Capo controls to show at the end of first day
    if (gameState?.scenario === 'capo' && gameState.phase === 'day' && gameState.round === 1) {
      setShowCapoControls(true);
    } else {
      setShowCapoControls(false);
    }
  }, [gameState?.phase, gameState?.round, gameState?.scenario]);

  if (!gameState) return null;

  const handlePlayerAction = () => {
    if (!selectedPlayer) return;
    
    switch (gameState.phase) {
      case 'night':
        // Night actions depend on the player's role
        if (gameState.scenario === 'classic') {
          if (gameState.players.find(p => p.id === selectedPlayer)?.role.name === 'Doctor') {
            savePlayerRole(selectedPlayer);
            addToGameLog(`Doctor attempted to save a player.`);
          } else {
            eliminatePlayer(selectedPlayer);
            addToGameLog(`Mafia chose a target.`);
          }
        } else {
          // For Capo scenario
          const targetPlayer = gameState.players.find(p => p.id === selectedPlayer);
          const roleName = targetPlayer?.role.name;
          
          if (roleName === 'Blacksmith') {
            savePlayerRole(selectedPlayer);
            addToGameLog(`Blacksmith attempted to save a player.`);
          } else if (roleName === 'Detective') {
            const isNegative = targetPlayer?.role.name === 'Don Mafia';
            addToGameLog(`Detective investigated a player. Result: ${isNegative ? 'Negative' : 'Positive'}`);
          } else if (roleName === 'Herbalist') {
            addToGameLog(`Herbalist attempted to poison a player.`);
          } else if (targetPlayer?.role.team === 'mafia') {
            eliminatePlayer(selectedPlayer);
            addToGameLog(`Mafia chose to eliminate a player.`);
          }
        }
        break;
      
      case 'day':
        // Regular day action
        revealPlayerRole(selectedPlayer);
        break;
      
      case 'voting':
        eliminatePlayer(selectedPlayer);
        addToGameLog(`The village voted to eliminate a player.`);
        break;
    }
    
    setSelectedPlayer(null);
  };

  const handleCityTrusteeSelection = () => {
    if (!selectedPlayer) return;
    
    setCityTrustee(selectedPlayer);
    addToGameLog(`${gameState.players.find(p => p.id === selectedPlayer)?.name} was elected as City Trustee.`);
    setSelectedPlayer(null);
  };

  const handleTargetSelection = () => {
    if (!selectedPlayer || capoTargets.includes(selectedPlayer) || capoTargets.length >= 2) return;
    
    const newTargets = [...capoTargets, selectedPlayer];
    setCapoTargets(newTargets);
    addToGameLog(`${gameState.players.find(p => p.id === selectedPlayer)?.name} was selected as a target.`);
    setSelectedPlayer(null);
    
    // If we have two targets, proceed to temporary night phase
    if (newTargets.length === 2) {
      addToGameLog(`Temporary night phase initiated for Capo's gun.`);
    }
  };

  const handleBulletSelection = (bulletType: 'blank' | 'live') => {
    if (firstBullet === null) {
      setFirstBullet(bulletType);
      addToGameLog(`First bullet loaded: ${bulletType}`);
    } else {
      // Execute Capo's gun logic
      const target1 = gameState.players.find(p => p.id === capoTargets[0]);
      const target2 = gameState.players.find(p => p.id === capoTargets[1]);
      
      if (firstBullet === 'blank') {
        // First bullet is blank, second must be live
        addToGameLog(`First shot (blank) fired. Second shot (live) fired at ${target2?.name}.`);
        eliminatePlayer(capoTargets[1]);
      } else {
        // First bullet is live
        addToGameLog(`First shot (live) fired at ${target1?.name}.`);
        eliminatePlayer(capoTargets[0]);
      }
      
      // Reset Capo state and continue to night phase
      setCityTrustee(null);
      setCapoTargets([]);
      setFirstBullet(null);
      setShowCapoControls(false);
      advancePhase(); // Move to night phase
    }
  };

  const handleResetCapo = () => {
    setCityTrustee(null);
    setCapoTargets([]);
    setFirstBullet(null);
    setShowCapoControls(false);
  };

  const getPhaseDisplay = () => {
    switch (gameState.phase) {
      case 'setup': return 'Setup';
      case 'night': return 'Night Phase';
      case 'day': return 'Day Phase';
      case 'voting': return 'Voting Phase';
      case 'results': return 'Results Phase';
      default: return 'Unknown Phase';
    }
  };

  const getActionButtonText = () => {
    if (!selectedPlayer) return 'Select a Player';
    
    switch (gameState.phase) {
      case 'night': return 'Perform Night Action';
      case 'day': return 'Reveal Role';
      case 'voting': return 'Eliminate Player';
      default: return 'Select Action';
    }
  };

  const getPlayerStatus = (player: Player) => {
    if (!player.isAlive) return 'Eliminated';
    if (capoTargets.includes(player.id)) return 'Target';
    if (player.id === cityTrustee) return 'Trustee';
    if (player.isSaved) return 'Saved';
    if (player.isRevealed) return player.role.name;
    return 'Active';
  };

  const getPlayerStatusClass = (player: Player) => {
    if (!player.isAlive) return 'bg-gray-700 text-gray-300';
    if (capoTargets.includes(player.id)) return 'bg-yellow-900 text-yellow-100';
    if (player.id === cityTrustee) return 'bg-purple-900 text-purple-100';
    if (player.isSaved) return 'bg-green-900 text-green-100';
    if (player.isRevealed) {
      return player.role.team === 'mafia' 
        ? 'bg-red-900 text-red-100' 
        : 'bg-blue-900 text-blue-100';
    }
    return 'bg-green-900 text-green-100';
  };

  // Check if any team has won
  const checkGameStatus = () => {
    const alivePlayers = gameState.players.filter(p => p.isAlive);
    const aliveMafia = alivePlayers.filter(p => p.role.team === 'mafia');
    
    if (aliveMafia.length === 0) {
      return 'Citizens Win!';
    }
    
    if (aliveMafia.length >= alivePlayers.length / 2) {
      return 'Mafia Wins!';
    }
    
    return null;
  };

  const gameStatus = checkGameStatus();

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-amber-500">
              Mafia Game - {gameState.scenario.charAt(0).toUpperCase() + gameState.scenario.slice(1)}
            </h1>
            <button 
              onClick={resetGame}
              className="sm:hidden text-gray-400 hover:text-amber-500 transition-colors"
              aria-label="Return to home"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </button>
          </div>
          <div className="flex items-center mt-2">
            <div className="mr-4 text-gray-400">Round {gameState.round}</div>
            <div className="px-3 py-1 bg-gray-800 text-amber-500 rounded-full font-medium">
              {getPhaseDisplay()}
            </div>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowLog(!showLog)}
            className="px-4 py-2 text-gray-300 hover:text-white border border-gray-700 rounded-lg hover:bg-gray-800 transition-colors"
          >
            {showLog ? 'Hide Log' : 'Show Log'}
          </button>
          <button
            onClick={resetGame}
            className="hidden sm:block px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Reset Game
          </button>
        </div>
      </div>

      {/* Game status banner */}
      {gameStatus && (
        <div className="mb-6 p-4 bg-amber-800 text-white rounded-lg font-bold text-center text-xl">
          {gameStatus}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-gray-900 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-white">Players</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {gameState.players.map(player => (
                <div 
                  key={player.id}
                  onClick={() => player.isAlive && setSelectedPlayer(player.id === selectedPlayer ? null : player.id)}
                  className={`
                    p-3 rounded-lg border cursor-pointer transition-all
                    ${!player.isAlive ? 'opacity-50 bg-gray-800 border-gray-700' : 'border-gray-700 hover:border-amber-500'}
                    ${player.id === selectedPlayer ? 'ring-2 ring-amber-500 border-amber-500' : ''}
                  `}
                >
                  <div className="flex justify-between items-start">
                    <div className="font-medium text-white">{player.name}</div>
                    <div 
                      className={`
                        px-2 py-1 text-xs rounded-full
                        ${getPlayerStatusClass(player)}
                      `}
                    >
                      {getPlayerStatus(player)}
                    </div>
                  </div>
                  {player.isRevealed && (
                    <div className="mt-2 text-sm text-gray-400">
                      {player.role.description}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6">
              {showCapoControls ? (
                <div className="space-y-4">
                  {!cityTrustee ? (
                    <>
                      <p className="text-amber-500 mb-2">City Trustee Election</p>
                      <button
                        onClick={handleCityTrusteeSelection}
                        disabled={!selectedPlayer}
                        className={`
                          w-full py-3 px-4 rounded-lg transition-colors focus:outline-none
                          ${selectedPlayer ? 'bg-amber-600 text-white hover:bg-amber-500' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
                        `}
                      >
                        Select City Trustee
                      </button>
                    </>
                  ) : capoTargets.length < 2 ? (
                    <>
                      <p className="text-amber-500 mb-2">
                        {capoTargets.length === 0 ? 'Select First Target' : 'Select Second Target'}
                      </p>
                      <button
                        onClick={handleTargetSelection}
                        disabled={!selectedPlayer || capoTargets.includes(selectedPlayer)}
                        className={`
                          w-full py-3 px-4 rounded-lg transition-colors focus:outline-none
                          ${selectedPlayer && !capoTargets.includes(selectedPlayer) ? 'bg-amber-600 text-white hover:bg-amber-500' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
                        `}
                      >
                        Confirm Target
                      </button>
                    </>
                  ) : firstBullet === null ? (
                    <>
                      <p className="text-amber-500 mb-2">Load Capo's Gun</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleBulletSelection('blank')}
                          className="flex-1 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                        >
                          First Bullet: Blank
                        </button>
                        <button
                          onClick={() => handleBulletSelection('live')}
                          className="flex-1 py-3 bg-red-700 text-white rounded-lg hover:bg-red-600"
                        >
                          First Bullet: Live
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-amber-500 mb-2">Second Bullet</p>
                      <button
                        onClick={() => handleBulletSelection(firstBullet === 'blank' ? 'live' : 'blank')}
                        className="w-full py-3 bg-red-700 text-white rounded-lg hover:bg-red-600"
                      >
                        Fire Second Bullet
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleResetCapo}
                    className="w-full py-2 border border-gray-700 text-gray-400 rounded-lg hover:bg-gray-800"
                  >
                    Reset Capo Controls
                  </button>
                </div>
              ) : (
                <button
                  onClick={handlePlayerAction}
                  disabled={!selectedPlayer}
                  className={`
                    w-full py-3 px-4 rounded-lg transition-colors focus:outline-none
                    ${selectedPlayer ? 'bg-amber-600 text-white hover:bg-amber-500' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}
                  `}
                >
                  {getActionButtonText()}
                </button>
              )}
            </div>
          </div>
          
          <div className="mt-6 bg-gray-900 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-700">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-white">Controls</h2>
            </div>
            <div className="flex flex-col space-y-3">
              <button
                onClick={advancePhase}
                className="w-full py-3 px-4 bg-amber-600 text-white rounded-lg hover:bg-amber-500 transition-colors focus:outline-none"
              >
                Next Phase
              </button>
            </div>
          </div>
        </div>
        
        {/* Game Log */}
        <div className={`${showLog ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-gray-900 rounded-xl shadow-lg p-4 sm:p-6 h-full border border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-white">Game Log</h2>
            <div className="overflow-y-auto max-h-[500px] space-y-2">
              {gameState.gameLog.map((entry, index) => (
                <div key={index} className="py-2 border-b border-gray-800 last:border-0">
                  <p className="text-gray-300">{entry}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 