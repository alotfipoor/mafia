'use client';

import { useState, useEffect } from 'react';

export default function GameTimer() {
  const [showTimer, setShowTimer] = useState<boolean>(false);
  const [time, setTime] = useState<number>(60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [timerDuration, setTimerDuration] = useState<number>(60);
  
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && time > 0) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime - 1);
      }, 1000);
    } else if (time === 0) {
      setIsRunning(false);
    }
    
    return () => clearInterval(interval);
  }, [isRunning, time]);
  
  const handleStart = () => {
    setTime(timerDuration);
    setIsRunning(true);
  };
  
  const handleStop = () => {
    setIsRunning(false);
  };
  
  const handleReset = () => {
    setTime(timerDuration);
    setIsRunning(false);
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="fixed bottom-28 left-4 z-20">
      {!showTimer ? (
        <button
          onClick={() => setShowTimer(true)}
          className="px-4 py-2 bg-blue-600/90 dark:bg-blue-700/90 text-white rounded-lg shadow-lg hover:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
        >
          Game Timer
        </button>
      ) : (
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-64">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">Game Timer</h2>
            <button
              onClick={() => setShowTimer(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="text-center mb-4">
            <div className={`text-4xl font-bold p-4 rounded-lg shadow-inner ${
              isRunning 
                ? time < 10 
                  ? 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30' 
                  : 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30'
                : 'text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700'
            }`}>
              {formatTime(time)}
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm text-gray-700 dark:text-gray-300 mb-1">Duration (seconds)</label>
            <div className="flex space-x-2">
              {[30, 60, 90, 120].map((duration) => (
                <button 
                  key={duration}
                  onClick={() => {
                    setTimerDuration(duration);
                    setTime(duration);
                  }}
                  className={`flex-1 py-1 text-sm rounded ${
                    timerDuration === duration 
                      ? 'bg-blue-600 dark:bg-blue-700 text-white' 
                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {duration}
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={handleStart}
              disabled={isRunning}
              className={`py-2 rounded ${
                !isRunning 
                  ? 'bg-green-600 text-white hover:bg-green-500' 
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              Start
            </button>
            <button
              onClick={handleStop}
              disabled={!isRunning}
              className={`py-2 rounded ${
                isRunning 
                  ? 'bg-red-600 text-white hover:bg-red-500' 
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              }`}
            >
              Stop
            </button>
            <button
              onClick={handleReset}
              className="py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Reset
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 