'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { GameState, ScenarioType } from '../models/types';
import { createNewGame, loadGame, saveGame } from '../utils/gameUtils';
import { useRouter } from 'next/navigation';

interface GameContextType {
  gameState: GameState | null;
  startGame: (playerNames: string[], scenario: ScenarioType) => void;
  resetGame: () => void;
  advancePhase: () => void;
  eliminatePlayer: (playerId: string) => void;
  savePlayerRole: (playerId: string) => void;
  revealPlayerRole: (playerId: string) => void;
  addToGameLog: (entry: string) => void;
  
  // Zodiac scenario methods
  blockPlayerAbility: (playerId: string) => void;
  placeBomb: (targetId: string, code: number) => void;
  attemptDefuseBomb: (guessedCode: number) => boolean;
  checkPlayerRole: () => void;
  
  // Jack scenario methods
  cursePLayer: (targetId: string) => void;
  useLastActionCard: (cardType: string, targetId?: string) => void;
  useMafiaNightAction: (actionType: 'shot' | 'sixthSense' | 'recruit', targetId: string) => void;
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
  const router = useRouter();

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
    // Clear game state
    setGameState(null);
    
    // Clear localStorage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('mafiaGameState');
    }
    
    // Use router.replace to reset URL without adding to history
    router.replace('/');
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

  // Zodiac scenario functions
  const blockPlayerAbility = (playerId: string) => {
    if (!gameState) return;

    const updatedPlayers = gameState.players.map(player => 
      player.id === playerId ? { ...player, isBlocked: true } : player
    );

    const blockedPlayer = gameState.players.find(p => p.id === playerId);
    const logEntry = blockedPlayer 
      ? `${blockedPlayer.name}'s ability was blocked.`
      : `A player's ability was blocked.`;

    setGameState({
      ...gameState,
      players: updatedPlayers,
      gameLog: [...gameState.gameLog, logEntry],
    });
  };

  const placeBomb = (targetId: string, code: number) => {
    if (!gameState || !gameState.zodiacScenario) return;

    const updatedPlayers = gameState.players.map(player => 
      player.id === targetId ? { ...player, hasBomb: true } : player
    );

    const targetPlayer = gameState.players.find(p => p.id === targetId);
    const logEntry = `A bomb was placed ${targetPlayer ? `on ${targetPlayer.name}` : 'on a player'}.`;

    setGameState({
      ...gameState,
      players: updatedPlayers,
      zodiacScenario: {
        ...gameState.zodiacScenario,
        bombActive: true,
        bombTarget: targetId,
        bombCode: code
      },
      gameLog: [...gameState.gameLog, logEntry],
    });
  };

  const attemptDefuseBomb = (guessedCode: number): boolean => {
    if (!gameState || !gameState.zodiacScenario || !gameState.zodiacScenario.bombActive) return false;

    const success = guessedCode === gameState.zodiacScenario.bombCode;
    
    if (success) {
      // If bomb is defused, clear bomb state
      const updatedPlayers = gameState.players.map(player => 
        player.id === gameState.zodiacScenario?.bombTarget 
          ? { ...player, hasBomb: false } 
          : player
      );

      setGameState({
        ...gameState,
        players: updatedPlayers,
        zodiacScenario: {
          ...gameState.zodiacScenario,
          bombActive: false,
          bombTarget: undefined,
          bombCode: undefined
        },
        gameLog: [...gameState.gameLog, 'The bomb was successfully defused!'],
      });
    } else {
      // Wrong guess
      setGameState({
        ...gameState,
        gameLog: [...gameState.gameLog, 'Failed attempt to defuse the bomb.'],
      });
    }

    return success;
  };

  const checkPlayerRole = () => {
    if (!gameState || !gameState.zodiacScenario || gameState.zodiacScenario.roleInquiriesLeft <= 0) return;

    setGameState({
      ...gameState,
      zodiacScenario: {
        ...gameState.zodiacScenario,
        roleInquiriesLeft: gameState.zodiacScenario.roleInquiriesLeft - 1
      },
      gameLog: [...gameState.gameLog, `A role inquiry was used. ${gameState.zodiacScenario.roleInquiriesLeft - 1} remaining.`],
    });
  };

  // Jack scenario functions
  const cursePLayer = (targetId: string) => {
    if (!gameState) return;

    // Find Jack Sparrow
    const jack = gameState.players.find(player => 
      player.role.name === 'Jack Sparrow' && player.isAlive
    );

    if (!jack) return;

    // Update Jack's cursed targets
    const updatedPlayers = gameState.players.map(player => {
      if (player.id === jack.id) {
        const updatedCursed = player.hasCursed ? [...player.hasCursed, targetId] : [targetId];
        return { ...player, hasCursed: updatedCursed };
      }
      return player;
    });

    const targetPlayer = gameState.players.find(p => p.id === targetId);
    
    setGameState({
      ...gameState,
      players: updatedPlayers,
      gameLog: [...gameState.gameLog, `Jack cursed a player${targetPlayer ? ` (${targetPlayer.name})` : ''}.`],
    });
  };

  const useLastActionCard = (cardType: string, targetId?: string) => {
    if (!gameState || !gameState.jackScenario) return;

    const jackScenario = { ...gameState.jackScenario };
    
    if (!jackScenario.lastActionCards) {
      jackScenario.lastActionCards = {};
    }

    let logEntry = `A "${cardType}" card was used.`;
    let updatedPlayers = [...gameState.players];

    switch (cardType) {
      case 'silenceOfTheLambs':
        jackScenario.lastActionCards.silenceOfTheLambs = true;
        if (targetId) {
          jackScenario.lastActionCards.silencedPlayers = [targetId];
        }
        break;
      case 'identityReveal':
        jackScenario.lastActionCards.identityReveal = true;
        if (targetId) {
          updatedPlayers = updatedPlayers.map(player => 
            player.id === targetId ? { ...player, isRevealed: true } : player
          );
          
          const targetPlayer = gameState.players.find(p => p.id === targetId);
          if (targetPlayer) {
            logEntry = `${targetPlayer.name}'s role (${targetPlayer.role.name}) was revealed.`;
          }
        }
        break;
      case 'beautifulMind':
        jackScenario.lastActionCards.beautifulMind = true;
        jackScenario.beautifulMindUsed = true;
        break;
      case 'handcuffs':
        jackScenario.lastActionCards.handcuffs = true;
        if (targetId) {
          jackScenario.lastActionCards.handcuffedPlayer = targetId;
          updatedPlayers = updatedPlayers.map(player => 
            player.id === targetId ? { ...player, isBlocked: true } : player
          );
          
          const targetPlayer = gameState.players.find(p => p.id === targetId);
          if (targetPlayer) {
            logEntry = `${targetPlayer.name} was handcuffed and lost their night ability.`;
          }
        }
        break;
      case 'faceSwap':
        jackScenario.lastActionCards.faceSwap = true;
        break;
      case 'duel':
        jackScenario.lastActionCards.duel = true;
        break;
      default:
        return;
    }

    setGameState({
      ...gameState,
      players: updatedPlayers,
      jackScenario,
      gameLog: [...gameState.gameLog, logEntry],
    });
  };

  const useMafiaNightAction = (actionType: 'shot' | 'sixthSense' | 'recruit', targetId: string) => {
    if (!gameState || !gameState.jackScenario) return;

    // Update which night action was used
    const jackScenario = { 
      ...gameState.jackScenario,
      nightAction: actionType
    };

    let logEntry = '';
    let updatedPlayers = [...gameState.players];
    
    const targetPlayer = gameState.players.find(p => p.id === targetId);
    
    switch (actionType) {
      case 'shot':
        if (targetPlayer) {
          // Handle special case: if target is Jack Sparrow, he is not killed but revealed
          if (targetPlayer.role.name === 'Jack Sparrow') {
            jackScenario.revealedJack = true;
            logEntry = 'Jack Sparrow was revealed!';
          } else {
            // Regular elimination
            updatedPlayers = updatedPlayers.map(player => 
              player.id === targetId ? { ...player, isAlive: false } : player
            );
            logEntry = `${targetPlayer.name} was eliminated by Mafia.`;
          }
        }
        break;
      case 'sixthSense':
        logEntry = 'Godfather used his Sixth Sense ability.';
        break;
      case 'recruit':
        // Can only recruit a simple citizen
        if (targetPlayer && targetPlayer.role.name === 'Simple Citizen') {
          updatedPlayers = updatedPlayers.map(player => 
            player.id === targetId ? { ...player, convertedToMafia: true, role: { ...player.role, team: 'mafia' } } : player
          );
          logEntry = 'Saul Goodman recruited a citizen to join the Mafia.';
        } else {
          logEntry = 'Saul Goodman attempted to recruit a player, but failed.';
        }
        break;
    }

    setGameState({
      ...gameState,
      players: updatedPlayers,
      jackScenario,
      gameLog: [...gameState.gameLog, logEntry],
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
        blockPlayerAbility,
        placeBomb,
        attemptDefuseBomb,
        checkPlayerRole,
        cursePLayer,
        useLastActionCard,
        useMafiaNightAction,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}; 