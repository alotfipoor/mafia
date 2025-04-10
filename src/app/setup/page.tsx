'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation'; // Import useRouter
import { ScenarioType } from '../models/types';
import { useGameContext } from '../context/GameContext';
import ScenarioSelector from '../components/ScenarioSelector';
import PlayerNameInput from '../components/PlayerNameInput';

export default function SetupPage() {
  const router = useRouter(); // Initialize router
  const { startGame } = useGameContext();
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
    router.replace('/'); // Use replace instead of push to avoid URL history stacking
  };

  const handleBack = () => {
    setSetupStep('scenario');
  };

  return (
    <main className="min-h-screen py-6 sm:py-12">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-indigo-600 dark:text-amber-500 mb-8">
          Game Setup
        </h1>

        {setupStep === 'scenario' ? (
          <ScenarioSelector onSelect={handleScenarioSelect} />
        ) : (
          <PlayerNameInput 
            scenario={selectedScenario} 
            playerCount={playerCount} 
            onSubmit={handlePlayerSubmit} 
            onBack={handleBack} // Pass handleBack function
          />
        )}
      </div>
    </main>
  );
} 