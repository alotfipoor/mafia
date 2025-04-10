'use client';

import { useGameContext } from '../context/GameContext';
import NightActionPanel from './NightActionPanel';
import CapoNightActionPanel from './CapoNightActionPanel';

export default function ActionPanel() {
  const { gameState } = useGameContext();
  
  if (!gameState) return null;
  
  // Only show action panels during night phase
  if (gameState.phase !== 'night' && gameState.phase !== 'day') return null;
  
  // Render the appropriate panel based on scenario and phase
  if (gameState.phase === 'night') {
    switch (gameState.scenario) {
      case 'zodiac':
        return <NightActionPanel />;
      case 'capo':
        return <CapoNightActionPanel />;
      case 'classic':
        // Use the generic NightActionPanel for classic scenario
        return <NightActionPanel />;
      case 'jack':
        // Could add a jack panel in the future
        return null;
      default:
        // Default to NightActionPanel for any undefined scenario
        return <NightActionPanel />;
    }
  } else if (gameState.phase === 'day') {
    // Day phase panels could be added here in the future
    return null;
  }
  
  return null;
} 