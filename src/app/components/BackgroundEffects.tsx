'use client';

import { useEffect } from 'react';
import { initParticles } from '../utils/particles';

export default function BackgroundEffects() {
  useEffect(() => {
    // Initialize particles after component mounts
    initParticles();
  }, []);

  return (
    <div className="gradient-background">
      <div className="gradient-sphere sphere-1"></div>
      <div className="gradient-sphere sphere-2"></div>
      <div className="gradient-sphere sphere-3"></div>
      <div className="glow"></div>
      <div className="grid-overlay"></div>
      <div className="noise-overlay"></div>
      <div className="particles-container" id="particles-container"></div>
    </div>
  );
} 