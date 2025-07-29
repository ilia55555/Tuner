
import React from 'react';

interface ControlsProps {
  isListening: boolean;
  onStart: () => void;
  onStop: () => void;
  error: string | null;
}

const Controls: React.FC<ControlsProps> = ({ isListening, onStart, onStop, error }) => {
  return (
    <div className="flex flex-col items-center justify-center space-y-4">
      <button
        onClick={isListening ? onStop : onStart}
        className={`px-8 py-4 text-2xl font-bold rounded-full transition-all duration-300 ease-in-out shadow-lg
          ${
            isListening
              ? 'bg-red-600 hover:bg-red-700 text-white'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }
          focus:outline-none focus:ring-4 focus:ring-opacity-75
          ${isListening ? 'focus:ring-red-400' : 'focus:ring-green-400' }
        `}
      >
        {isListening ? 'Stop' : 'Start'}
      </button>
      {error && <p className="text-red-400 mt-4 text-center">{error}</p>}
    </div>
  );
};

export default Controls;