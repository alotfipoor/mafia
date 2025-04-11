'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export default function GameTimer() {
  const [time, setTime] = useState<number>(60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timerDuration, setTimerDuration] = useState<number>(60);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Memoize handle functions to use in useEffect dependencies
  const handleReset = useCallback(() => {
    setTime(timerDuration);
    setIsRunning(false);
  }, [timerDuration]);

  const handleStart = useCallback(() => {
    setTime(timerDuration);
    setIsRunning(true);
  }, [timerDuration]);

  const handleStop = () => {
    setIsRunning(false);
  };
  
  // Countdown timer effect
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTime(prevTime => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current!);
            intervalRef.current = null;
            setIsRunning(false);
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning]);
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Find the timer container element and render/update timer
  useEffect(() => {
    const timerContainer = document.getElementById('timer-container');
    if (timerContainer) {
      const timerContent = timerContainer.querySelector('div');
      if (timerContent) {
        const renderTimer = () => {
          timerContent.innerHTML = `
            <div class="flex justify-between items-center mb-4">
              <h2 class="text-xl font-bold text-gray-800 dark:text-gray-200">Game Timer</h2>
              <button
                id="close-timer"
                class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div class="text-center mb-4">
              <div class="${
                isRunning 
                  ? time < 10 
                    ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30' 
                    : 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30'
                  : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700'
              } text-4xl font-bold p-4 rounded-lg shadow-inner">
                ${formatTime(time)}
              </div>
            </div>
            
            <div class="mb-4">
              <label class="block text-sm text-gray-700 dark:text-gray-300 mb-1">Duration (seconds)</label>
              <div class="duration-selector flex space-x-2">
                ${[30, 60, 90, 120].map((duration) => `
                  <button 
                    data-duration="${duration}"
                    class="${
                      timerDuration === duration 
                        ? 'bg-blue-600 dark:bg-blue-700 text-white' 
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                    } flex-1 py-1 text-sm rounded"
                  >
                    ${duration}
                  </button>
                `).join('')}
              </div>
            </div>
            
            <div class="grid grid-cols-3 gap-2">
              <button
                id="start-timer"
                ${isRunning ? 'disabled' : ''}
                class="${
                  !isRunning 
                    ? 'bg-green-600 text-white hover:bg-green-500' 
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                } py-2 rounded"
              >
                Start
              </button>
              <button
                id="stop-timer"
                ${!isRunning ? 'disabled' : ''}
                class="${
                  isRunning 
                    ? 'bg-red-600 text-white hover:bg-red-500' 
                    : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                } py-2 rounded"
              >
                Stop
              </button>
              <button
                id="reset-timer"
                class="py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
              >
                Reset
              </button>
            </div>
          `;
          
          // Add event listeners
          document.getElementById('close-timer')?.addEventListener('click', () => {
            if (timerContainer) timerContainer.classList.add('hidden');
          });
          
          document.getElementById('start-timer')?.addEventListener('click', handleStart);
          document.getElementById('stop-timer')?.addEventListener('click', handleStop);
          document.getElementById('reset-timer')?.addEventListener('click', handleReset);
          
          // Duration selector buttons
          document.querySelectorAll('.duration-selector button').forEach(button => {
            button.addEventListener('click', (e) => {
              const duration = parseInt((e.currentTarget as HTMLElement).dataset.duration || '60');
              setTimerDuration(duration);
              setTime(duration);
            });
          });
        };
        
        // Initial render
        renderTimer();
        
      }
    }
  }, [isRunning, time, timerDuration, handleStart, handleReset]); // Added handleStart and handleReset to dependencies
  
  // This component doesn't render anything directly
  // It just manipulates the DOM of the timer container
  return null;
} 