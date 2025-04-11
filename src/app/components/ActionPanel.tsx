'use client';

import { useGameContext } from '../context/GameContext';
import NightActionPanel from './NightActionPanel';
import CapoNightActionPanel from './CapoNightActionPanel';
import ZodiacNightActionPanel from './ZodiacNightActionPanel';

interface ActionPanelProps {
  isMobileCapoVisible: boolean;
  closeMobileCapoPanel: () => void;
  isMobileZodiacVisible: boolean;
  closeMobileZodiacPanel: () => void;
}

export default function ActionPanel({ 
  isMobileCapoVisible, 
  closeMobileCapoPanel, 
  isMobileZodiacVisible, 
  closeMobileZodiacPanel 
}: ActionPanelProps) {
  const { gameState } = useGameContext();
  
  if (!gameState) return null;
  
  // Only show action panels during night phase
  if (gameState.phase !== 'night') return null; // Simplified condition
  
  // Render the appropriate panel based on scenario
  switch (gameState.scenario) {
    case 'zodiac':
      return <ZodiacNightActionPanel isMobileVisible={isMobileZodiacVisible} closeMobilePanel={closeMobileZodiacPanel} />;
    case 'capo':
      return <CapoNightActionPanel isMobileVisible={isMobileCapoVisible} closeMobilePanel={closeMobileCapoPanel} />;
    case 'classic':
      // Generic panel doesn't need mobile props currently
      return <NightActionPanel />;
    case 'jack':
      // Could add a jack panel in the future
      return null;
    default:
      // Default to NightActionPanel for any undefined scenario
      return <NightActionPanel />;
  }
} 