'use client';

import { useEffect, useState } from 'react';
import { Player } from '../models/types';
import { useGameContext } from '../context/GameContext';
import { useThemeContext } from '../context/ThemeContext';
import ActionPanel from './ActionPanel';
import BombDefusalPanel from './BombDefusalPanel';
import RoleInquiryPanel from './RoleInquiryPanel';
import CapoTrusteePanel from './CapoTrusteePanel';
import GameTimer from './GameTimer';
import PoisonVotePanel from './PoisonVotePanel';
import VillageChiefPanel from './VillageChiefPanel';

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
  
  const { toggleTheme } = useThemeContext();

  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [showLog, setShowLog] = useState<boolean>(false);
  const [cityTrustee, setCityTrustee] = useState<string | null>(null);
  const [capoTargets, setCapoTargets] = useState<string[]>([]);
  const [showCapoControls, setShowCapoControls] = useState<boolean>(false);
  const [firstBullet, setFirstBullet] = useState<'blank' | 'live' | null>(null);
  const [showTimer, setShowTimer] = useState<boolean>(false);
  
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
        // Night actions depend on the player&apos;s role
        if (gameState.scenario === 'classic') {
          const targetPlayer = gameState.players.find(p => p.id === selectedPlayer);
          if (!targetPlayer) return;
          
          if (gameState.round === 1) {
            // First night is just for mafia to know each other
            addToGameLog(`First night - no actions are performed.`);
          } else if (gameState.players.find(p => p.id === selectedPlayer)?.role.name === 'Doctor') {
            savePlayerRole(selectedPlayer);
            addToGameLog(`Doctor attempted to save ${targetPlayer.name}.`);
          } else {
            eliminatePlayer(selectedPlayer);
            addToGameLog(`Mafia chose to eliminate ${targetPlayer.name}.`);
          }
        } else {
          // For Capo scenario
          const targetPlayer = gameState.players.find(p => p.id === selectedPlayer);
          if (!targetPlayer) return;
          
          if (gameState.round === 1) {
            // First night is just for mafia to know each other
            addToGameLog(`First night - no actions are performed.`);
          } else if (targetPlayer.role.name === 'Blacksmith') {
            savePlayerRole(selectedPlayer);
            addToGameLog(`Blacksmith attempted to save ${targetPlayer.name}.`);
          } else if (targetPlayer.role.name === 'Detective') {
            // Find the target of the detective's investigation (currently selected player)
            const investigationTarget = gameState.players.find(p => p.id === selectedPlayer);
            // Don Mafia always gives negative result, as do all non-mafia roles
            const isNegative = investigationTarget?.role.name === 'Don Mafia' || investigationTarget?.role.team !== 'mafia';
            addToGameLog(`Detective investigated ${targetPlayer.name}. Result: ${isNegative ? 'Negative' : 'Positive'}`);
          } else if (targetPlayer.role.name === 'Herbalist') {
            addToGameLog(`Herbalist attempted to poison ${targetPlayer.name}.`);
          } else if (targetPlayer.role.team === 'mafia') {
            eliminatePlayer(selectedPlayer);
            addToGameLog(`Mafia chose to eliminate ${targetPlayer.name}.`);
          }
        }
        break;
      
      case 'day':
        // Regular day action
        const targetPlayer = gameState.players.find(p => p.id === selectedPlayer);
        if (!targetPlayer) return;
        
        revealPlayerRole(selectedPlayer);
        break;
      
      case 'voting':
        const votedPlayer = gameState.players.find(p => p.id === selectedPlayer);
        if (!votedPlayer) return;
        
        eliminatePlayer(selectedPlayer);
        addToGameLog(`The village voted to eliminate ${votedPlayer.name}.`);
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
      addToGameLog(`Temporary night phase initiated for Capo&apos;s gun.`);
    }
  };

  const handleBulletSelection = (bulletType: 'blank' | 'live') => {
    if (firstBullet === null) {
      setFirstBullet(bulletType);
      addToGameLog(`First bullet loaded: ${bulletType}`);
    } else {
      // Execute Capo&apos;s gun logic
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
      case 'setup': return 'Introduction Round';
      case 'night': return gameState.round === 1 ? 'First Night (Mafia Only)' : 'Night Phase';
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

  // Commenting out unused function
  /* 
  const getPlayerStatus = (player: Player) => {
    if (!player.isAlive) return 'Eliminated';
    if (capoTargets.includes(player.id)) return 'Target';
    if (player.id === cityTrustee) return 'Trustee';
    if (player.isSaved) return 'Saved';
    if (player.isRevealed) return player.role.name;
    return 'Active';
  };
  */

  const getPlayerStatusClass = (player: Player) => {
    if (!player.isAlive) return 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-300';
    if (capoTargets.includes(player.id)) return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100';
    if (player.id === cityTrustee) return 'bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100';
    if (player.isSaved) return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100';
    // Always show role if alive
    return player.role.team === 'mafia' 
      ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100' 
      : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100';
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
    <div className="container mx-auto px-4 py-6 pb-28 md:pb-20 mb-20">
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <div className="flex justify-between items-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-indigo-600 dark:text-amber-500 drop-shadow-md">
              Mafia Game - {gameState.scenario.charAt(0).toUpperCase() + gameState.scenario.slice(1)}
            </h1>
          </div>
          <div className="flex items-center mt-2">
            <div className="mr-4 text-gray-600 dark:text-gray-300">Round {gameState.round}</div>
            <div className="px-3 py-1 bg-indigo-100/90 dark:bg-gray-800/90 text-indigo-700 dark:text-amber-500 rounded-full font-medium shadow-sm">
              {getPhaseDisplay()}
            </div>
          </div>
        </div>
        
        {/* Top right buttons - only show on larger screens - removed theme toggle */}
        <div className="hidden md:flex space-x-2">
          <button
            onClick={() => setShowLog(!showLog)}
            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-colors backdrop-blur-sm"
          >
            {showLog ? 'Hide Log' : 'Show Log'}
          </button>
          <button
            onClick={() => advancePhase()}
            className="px-4 py-2 bg-indigo-600 dark:bg-amber-600 text-white rounded-lg hover:bg-indigo-500 dark:hover:bg-amber-500 transition-colors backdrop-blur-sm shadow-sm"
          >
            Next Phase
          </button>
        </div>
      </div>

      {/* Game status banner */}
      {gameStatus && (
        <div className="mb-6 p-4 bg-indigo-100/90 dark:bg-amber-800/90 text-indigo-800 dark:text-gray-100 rounded-lg font-bold text-center text-xl shadow-md backdrop-blur-sm">
          {gameStatus}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 backdrop-blur-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Players</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
              {gameState.players.map((player) => (
                <div 
                  key={player.id}
                  className={`p-4 border rounded-lg cursor-pointer transition-all duration-150 backdrop-blur-sm shadow-sm
                    ${getPlayerStatusClass(player)}
                    ${selectedPlayer === player.id ? 'border-indigo-500 dark:border-amber-500 ring-2 ring-indigo-500 dark:ring-amber-500' : 'border-gray-300 dark:border-gray-700'}
                    ${player.isAlive ? 'hover:bg-opacity-80 hover:border-gray-400 dark:hover:border-gray-600' : 'opacity-60 cursor-not-allowed'}
                  `}
                  onClick={() => player.isAlive && setSelectedPlayer(player.id)}
                >
                  <div className="font-bold text-lg mb-1">{player.name}</div>
                  {/* Always display the role */}
                  <div className="text-sm font-mono">Role: {player.role.name}</div>
                  {/* Display status like Eliminated, Target, Trustee, Saved if applicable */} 
                  {!player.isAlive && <div className="text-xs mt-1">Status: Eliminated</div>}
                  {player.isAlive && capoTargets.includes(player.id) && <div className="text-xs mt-1">Status: Target</div>}
                  {player.isAlive && player.id === cityTrustee && <div className="text-xs mt-1">Status: Trustee</div>}
                  {player.isAlive && player.isSaved && <div className="text-xs mt-1">Status: Saved</div>}
                </div>
              ))}
            </div>

            <div className="mt-6">
              {showCapoControls ? (
                <div className="space-y-4">
                  {!cityTrustee ? (
                    <>
                      <p className="text-indigo-600 dark:text-amber-500 mb-2">City Trustee Election</p>
                      <button
                        onClick={handleCityTrusteeSelection}
                        disabled={!selectedPlayer}
                        className={`
                          w-full py-3 px-4 rounded-lg transition-colors focus:outline-none shadow-sm
                          ${selectedPlayer ? 'bg-indigo-600 dark:bg-amber-600 text-white hover:bg-indigo-500 dark:hover:bg-amber-500' : 'bg-gray-200/90 dark:bg-gray-700/90 text-gray-500 dark:text-gray-400 cursor-not-allowed'}
                        `}
                      >
                        Select City Trustee
                      </button>
                    </>
                  ) : capoTargets.length < 2 ? (
                    <>
                      <p className="text-indigo-600 dark:text-amber-500 mb-2">
                        {capoTargets.length === 0 ? 'Select First Target' : 'Select Second Target'}
                      </p>
                      <button
                        onClick={handleTargetSelection}
                        disabled={!selectedPlayer || capoTargets.includes(selectedPlayer)}
                        className={`
                          w-full py-3 px-4 rounded-lg transition-colors focus:outline-none shadow-sm
                          ${selectedPlayer && !capoTargets.includes(selectedPlayer) ? 'bg-indigo-600 dark:bg-amber-600 text-white hover:bg-indigo-500 dark:hover:bg-amber-500' : 'bg-gray-200/90 dark:bg-gray-700/90 text-gray-500 dark:text-gray-400 cursor-not-allowed'}
                        `}
                      >
                        Confirm Target
                      </button>
                    </>
                  ) : firstBullet === null ? (
                    <>
                      <p className="text-indigo-600 dark:text-amber-500 mb-2">Load Capo&apos;s Gun</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleBulletSelection('blank')}
                          className="flex-1 py-3 bg-gray-200/90 dark:bg-gray-700/90 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 shadow-sm"
                        >
                          First Bullet: Blank
                        </button>
                        <button
                          onClick={() => handleBulletSelection('live')}
                          className="flex-1 py-3 bg-red-600/90 dark:bg-red-700/90 text-white rounded-lg hover:bg-red-500 dark:hover:bg-red-600 shadow-sm"
                        >
                          First Bullet: Live
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-indigo-600 dark:text-amber-500 mb-2">Second Bullet</p>
                      <button
                        onClick={() => handleBulletSelection(firstBullet === 'blank' ? 'live' : 'blank')}
                        className="w-full py-3 bg-red-600/90 dark:bg-red-700/90 text-white rounded-lg hover:bg-red-500 dark:hover:bg-red-600 shadow-sm"
                      >
                        Fire Second Bullet
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleResetCapo}
                    className="w-full py-2 border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-gray-100/80 dark:hover:bg-gray-800/80 backdrop-blur-sm"
                  >
                    Reset Capo Controls
                  </button>
                </div>
              ) : (
                <button
                  onClick={handlePlayerAction}
                  disabled={!selectedPlayer}
                  className={`
                    w-full py-3 px-4 rounded-lg transition-colors focus:outline-none shadow-sm
                    ${selectedPlayer ? 'bg-indigo-600 dark:bg-amber-600 text-white hover:bg-indigo-500 dark:hover:bg-amber-500' : 'bg-gray-200/90 dark:bg-gray-700/90 text-gray-500 dark:text-gray-400 cursor-not-allowed'}
                  `}
                >
                  {getActionButtonText()}
                </button>
              )}
            </div>
          </div>
          
          <div className="mt-6 bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 backdrop-blur-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Controls</h2>
            </div>
            <div className="flex flex-col space-y-3">
              <button
                onClick={advancePhase}
                className="w-full py-3 px-4 bg-indigo-600 dark:bg-amber-600 text-white rounded-lg hover:bg-indigo-500 dark:hover:bg-amber-500 transition-colors focus:outline-none shadow-sm"
              >
                Next Phase
              </button>
              <button
                onClick={resetGame}
                className="w-full py-3 px-4 bg-gray-200/90 dark:bg-gray-700/90 text-gray-800 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors focus:outline-none flex items-center justify-center shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Return to Home
              </button>
            </div>
          </div>
        </div>
        
        {/* Game Log - hidden on mobile by default unless toggled */}
        <div className={`${showLog ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white/80 dark:bg-gray-900/80 rounded-xl shadow-lg p-4 sm:p-6 h-full border border-gray-200 dark:border-gray-700 backdrop-blur-md">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Game Log</h2>
            <div className="overflow-y-auto max-h-[500px] space-y-2">
              {gameState.gameLog.map((entry, index) => (
                <div key={index} className="py-2 border-b border-gray-200 dark:border-gray-800 last:border-0">
                  <p className="text-gray-700 dark:text-gray-300">{entry}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile bottom navigation bar - Very high z-index */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-3 px-4 z-[5000] md:hidden">
        <div className="flex justify-between items-center">
          <button
            onClick={resetGame}
            className="flex flex-col items-center text-indigo-600 dark:text-amber-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs mt-1">Home</span>
          </button>
          
          <button
            onClick={() => setShowLog(!showLog)}
            className="flex flex-col items-center text-indigo-600 dark:text-amber-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <span className="text-xs mt-1">Log</span>
          </button>
          
          <button
            onClick={() => setShowTimer(!showTimer)}
            className="flex flex-col items-center text-indigo-600 dark:text-amber-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs mt-1">Timer</span>
          </button>

          <button
            onClick={advancePhase}
            className="flex flex-col items-center text-indigo-600 dark:text-amber-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-xs mt-1">Next</span>
          </button>
          
          {/* Mobile menu button - opens up more options */}
          <button 
            onClick={() => document.getElementById('mobile-menu')?.classList.toggle('hidden')}
            className="flex flex-col items-center text-indigo-600 dark:text-amber-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
            <span className="text-xs mt-1">More</span>
          </button>
        </div>
      </div>
      
      {/* Mobile menu popup - Even higher z-index */}
      <div 
        id="mobile-menu" 
        className="fixed bottom-20 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-[5001] hidden"
      >
        <div className="space-y-3">
          {gameState.phase === 'night' && gameState.round > 1 && (
            <button 
              className="flex items-center w-full px-4 py-2 text-left bg-indigo-100 dark:bg-gray-700 text-indigo-700 dark:text-amber-400 rounded-lg"
              onClick={() => {
                document.getElementById('night-actions-panel')?.classList.toggle('hidden');
                document.getElementById('mobile-menu')?.classList.add('hidden');
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
              Night Actions
            </button>
          )}
          
          {gameState.scenario === 'capo' && (
            <>
              <button 
                className="flex items-center w-full px-4 py-2 text-left bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg"
                onClick={() => {
                  // Toggle the capo night actions panel container
                  document.getElementById('capo-night-actions-panel-container')?.classList.toggle('hidden');
                  document.getElementById('mobile-menu')?.classList.add('hidden');
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Capo Night Actions
              </button>
              
              <button 
                className="flex items-center w-full px-4 py-2 text-left bg-indigo-100 dark:bg-gray-700 text-indigo-700 dark:text-amber-400 rounded-lg"
                onClick={() => {
                  setShowCapoControls(prev => !prev);
                  document.getElementById('mobile-menu')?.classList.add('hidden');
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Capo Controls
              </button>
              
              <button 
                className="flex items-center w-full px-4 py-2 text-left bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg"
                onClick={() => {
                  document.getElementById('village-chief-panel')?.classList.toggle('hidden');
                  document.getElementById('mobile-menu')?.classList.add('hidden');
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Village Chief Links
              </button>
              
              <button 
                className="flex items-center w-full px-4 py-2 text-left bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-lg"
                onClick={() => {
                  document.getElementById('poison-panel')?.classList.toggle('hidden');
                  document.getElementById('mobile-menu')?.classList.add('hidden');
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                Poison Controls
              </button>
            </>
          )}

          {gameState.scenario === 'zodiac' && (
            <>
              <button 
                className="flex items-center w-full px-4 py-2 text-left bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg"
                onClick={() => {
                  // Toggle the zodiac runner actions panel container
                  document.getElementById('zodiac-night-actions-panel-container')?.classList.toggle('hidden');
                  document.getElementById('mobile-menu')?.classList.add('hidden');
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Runner Actions
              </button>
              
              <button 
                className="flex items-center w-full px-4 py-2 text-left bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 rounded-lg"
                onClick={() => {
                  document.getElementById('bomb-defusal-panel')?.classList.toggle('hidden');
                  document.getElementById('mobile-menu')?.classList.add('hidden');
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Bomb Defusal
              </button>
              
              {gameState.zodiacScenario && gameState.zodiacScenario.roleInquiriesLeft > 0 && (
                <button 
                  className="flex items-center w-full px-4 py-2 text-left bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-lg"
                  onClick={() => {
                    // Toggle the role check panel container
                    document.getElementById('role-check-panel-container')?.classList.toggle('hidden');
                    document.getElementById('mobile-menu')?.classList.add('hidden');
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Check Roles ({gameState.zodiacScenario.roleInquiriesLeft})
                </button>
              )}
            </>
          )}
          
          <button 
            className="flex items-center w-full px-4 py-2 text-left bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
            onClick={() => {
              toggleTheme();
              document.getElementById('mobile-menu')?.classList.add('hidden');
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
            Toggle Theme
          </button>
        </div>
      </div>

      {/* Hidden panels - adjust z-index, lower than nav/menu */}
      <div id="night-actions-panel" className="fixed top-20 right-4 z-[4000] hidden">
         <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-80">
           <div className="flex justify-between items-center mb-4">
             <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Night Actions</h2>
             <button
               onClick={() => document.getElementById('night-actions-panel')?.classList.add('hidden')}
               className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
             >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
               </svg>
             </button>
           </div>
           
           {/* Night actions content will be rendered by the NightActionPanel component */}
         </div>
      </div>
      <div id="timer-container" className={`fixed bottom-20 left-4 z-[4000] ${showTimer ? 'block' : 'hidden'}`}>
         <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-64">
           {/* Timer content will be inserted here by GameTimer component */}
         </div>
      </div>
      <div id="village-chief-panel" className="fixed top-20 right-4 z-[4000] hidden">
         <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-80 max-h-[80vh] overflow-y-auto">
           <VillageChiefPanel />
         </div>
      </div>
      <div id="poison-panel" className="fixed top-20 right-4 z-[4000] hidden">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-80 max-h-[80vh] overflow-y-auto">
          <PoisonVotePanel />
        </div>
      </div>
      <div id="bomb-defusal-panel" className="fixed top-20 right-4 z-[4000] hidden">
         <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-80 max-h-[80vh] overflow-y-auto">
           <BombDefusalPanel />
         </div>
      </div>
      
      <div id="role-check-panel-container" className="fixed top-20 right-4 z-[4000] hidden bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-80 max-h-[80vh] overflow-y-auto">
         {/* Role check panel content will be portal'd here */}
      </div>
      
      <div id="capo-night-actions-panel-container" className="fixed top-20 right-4 z-[4000] hidden bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-80 max-h-[80vh] overflow-y-auto">
         {/* Capo night actions panel content will be portal'd here */}
      </div>

      {/* Render components that manage their own content or insert into containers */} 
      <ActionPanel />
      <GameTimer />

      {/* Ensure other panels like RoleInquiryPanel/CapoTrusteePanel are handled appropriately */}
      <RoleInquiryPanel />
      <CapoTrusteePanel />

      {/* New panels for Zodiac scenario */}
      <div id="zodiac-night-actions-panel-container" className="fixed top-20 right-4 z-[4000] hidden bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-80 max-h-[80vh] overflow-y-auto">
         {/* Zodiac night actions panel content will be portal'd here */}
      </div>
    </div>
  );
} 