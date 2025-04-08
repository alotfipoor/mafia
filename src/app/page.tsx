'use client';

import { useState } from 'react';
import { ScenarioType } from './models/types';
import { useGameContext } from './context/GameContext';
import ScenarioSelector from './components/ScenarioSelector';
import PlayerNameInput from './components/PlayerNameInput';
import RoleReveal from './components/RoleReveal';
import GameBoard from './components/GameBoard';

export default function Home() {
  const { gameState, startGame, advancePhase } = useGameContext();
  const [setupStep, setSetupStep] = useState<'scenario' | 'players'>('scenario');
  const [selectedScenario, setSelectedScenario] = useState<ScenarioType>('classic');
  const [playerCount, setPlayerCount] = useState<number>(6);

  const handleScenarioSelect = (scenario: ScenarioType, count: number) => {
    setSelectedScenario(scenario);
    setPlayerCount(count);
    setSetupStep('players');
  };

  const handlePlayerSubmit = (playerNames: string[]) => {
    startGame(playerNames, selectedScenario);
  };

  // If there's no game state, show setup process
  if (!gameState) {
    return (
      <main className="min-h-screen py-6 sm:py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-8 sm:mb-12 text-amber-500">
            Mafia Game
          </h1>
          
          {setupStep === 'scenario' ? (
            <ScenarioSelector onSelect={handleScenarioSelect} />
          ) : (
            <PlayerNameInput 
              scenario={selectedScenario} 
              playerCount={playerCount} 
              onSubmit={handlePlayerSubmit} 
              onBack={() => setSetupStep('scenario')} 
            />
          )}
        </div>
      </main>
    );
  }

  // If game is in setup phase, show role reveal
  if (gameState.phase === 'setup') {
    return (
      <RoleReveal 
        players={gameState.players} 
        onComplete={advancePhase} 
      />
    );
  }

  // Show game board for other phases
  return <GameBoard />;
}
