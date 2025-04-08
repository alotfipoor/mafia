'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GameState, Player, ScenarioType } from '../models/types';
import { createNewGame, loadGame, saveGame } from '../utils/gameUtils';

interface GameContextType {
  gameState: GameState | null;
  startGame: (playerNames: string[], scenario: ScenarioType) => void;
  resetGame: () => void;
  advancePhase: () => void;
  eliminatePlayer: (playerId: string) => void;
  savePlayerRole: (playerId: string) => void;
  revealPlayerRole: (playerId: string) => void;
  addToGameLog: (entry: string) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export const useGameContext = () => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);

  // Try to load a saved game on initial mount
  useEffect(() => {
    const savedGame = loadGame();
    if (savedGame) {
      setGameState(savedGame);
    }
  }, []);

  // Save game state when it changes
  useEffect(() => {
    if (gameState) {
      saveGame(gameState);
    }
  }, [gameState]);

  const startGame = (playerNames: string[], scenario: ScenarioType) => {
    const newGame = createNewGame(playerNames, scenario);
    setGameState(newGame);
  };

  const resetGame = () => {
    setGameState(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mafiaGameState');
    }
  };

  const advancePhase = () => {
    if (!gameState) return;

    const phases: GameState['phase'][] = ['setup', 'night', 'day', 'voting', 'results'];
    const currentPhaseIndex = phases.indexOf(gameState.phase);
    const nextPhase = phases[(currentPhaseIndex + 1) % phases.length];
    
    let newRound = gameState.round;
    if (nextPhase === 'night' && gameState.phase === 'results') {
      newRound += 1;
    }

    setGameState({
      ...gameState,
      phase: nextPhase,
      round: newRound,
      gameLog: [...gameState.gameLog, `Phase changed to ${nextPhase}${newRound > gameState.round ? ` (Round ${newRound})` : ''}`],
    });
  };

  const eliminatePlayer = (playerId: string) => {
    if (!gameState) return;

    const updatedPlayers = gameState.players.map(player => 
      player.id === playerId ? { ...player, isAlive: false } : player
    );

    const eliminatedPlayer = gameState.players.find(p => p.id === playerId);
    const logEntry = eliminatedPlayer 
      ? `${eliminatedPlayer.name} (${eliminatedPlayer.role.name}) was eliminated.`
      : `A player was eliminated.`;

    setGameState({
      ...gameState,
      players: updatedPlayers,
      gameLog: [...gameState.gameLog, logEntry],
    });
  };

  const savePlayerRole = (playerId: string) => {
    if (!gameState) return;

    const updatedPlayers = gameState.players.map(player => 
      player.id === playerId ? { ...player, isSaved: true } : player
    );

    const savedPlayer = gameState.players.find(p => p.id === playerId);
    const logEntry = savedPlayer 
      ? `${savedPlayer.name} was saved.`
      : `A player was saved.`;

    setGameState({
      ...gameState,
      players: updatedPlayers,
      gameLog: [...gameState.gameLog, logEntry],
    });
  };

  const revealPlayerRole = (playerId: string) => {
    if (!gameState) return;

    const updatedPlayers = gameState.players.map(player => 
      player.id === playerId ? { ...player, isRevealed: true } : player
    );

    const revealedPlayer = gameState.players.find(p => p.id === playerId);
    const logEntry = revealedPlayer 
      ? `${revealedPlayer.name}'s role (${revealedPlayer.role.name}) was revealed.`
      : `A player's role was revealed.`;

    setGameState({
      ...gameState,
      players: updatedPlayers,
      gameLog: [...gameState.gameLog, logEntry],
    });
  };

  const addToGameLog = (entry: string) => {
    if (!gameState) return;

    setGameState({
      ...gameState,
      gameLog: [...gameState.gameLog, entry],
    });
  };

  return (
    <GameContext.Provider
      value={{
        gameState,
        startGame,
        resetGame,
        advancePhase,
        eliminatePlayer,
        savePlayerRole,
        revealPlayerRole,
        addToGameLog,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}; 