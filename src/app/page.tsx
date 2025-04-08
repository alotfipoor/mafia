'use client';

import { useState, useEffect } from 'react';
import { ScenarioType } from './models/types';
import { useGameContext } from './context/GameContext';
import ScenarioSelector from './components/ScenarioSelector';
import PlayerNameInput from './components/PlayerNameInput';
import RoleReveal from './components/RoleReveal';
import GameBoard from './components/GameBoard';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const { gameState, startGame, advancePhase } = useGameContext();

  // If there's no game state, show the welcome/landing page content
  if (!gameState) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <main className="flex flex-col items-center justify-center w-full flex-1 px-4 sm:px-20 text-center">
          <h1 className="text-4xl sm:text-6xl font-bold mb-6 sm:mb-8 text-gray-900 dark:text-gray-100 drop-shadow-xl">
            Welcome to Mafia
          </h1>

          <p className="mt-3 text-xl sm:text-2xl mb-6 sm:mb-8 text-gray-700 dark:text-gray-300 max-w-2xl drop-shadow-lg backdrop-blur-sm px-4 py-2 rounded-lg">
            The classic game of deception and deduction.
          </p>
          
          <div className="mb-6 sm:mb-8">
            <Image
              src="/logo.png"
              alt="Mafia Logo"
              width={350}
              height={350}
              priority
              unoptimized
              className="object-contain"
            />
          </div>

          <div className="flex flex-wrap items-center justify-around max-w-4xl mt-4 sm:mt-6 w-full">
            <Link href="/setup" className="mt-4 sm:mt-6 w-full max-w-sm rounded-xl border border-gray-300 dark:border-gray-700 p-4 sm:p-6 text-left bg-white/80 dark:bg-gray-900/80 text-gray-900 dark:text-gray-100 hover:bg-white/90 dark:hover:bg-gray-800/90 focus:bg-white/90 dark:focus:bg-gray-800/90 transition-colors shadow-sm backdrop-blur-md">
              <h3 className="text-xl sm:text-2xl font-bold">Start New Game &rarr;</h3>
              <p className="mt-2 sm:mt-4 text-lg sm:text-xl text-gray-600 dark:text-gray-400">
                Gather your friends and start a new round.
              </p>
            </Link>
          </div>
        </main>
      </div>
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
