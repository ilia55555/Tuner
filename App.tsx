
import React, { useState, useCallback } from 'react';
import { usePitchDetection } from './hooks/usePitchDetection';
import { frequencyToNote } from './utils/musicUtils';
import type { Pitch, NoteDetails } from './types';
import TunerDisplay from './components/TunerDisplay';
import Controls from './components/Controls';
import FrequencyControl from './components/FrequencyControl';
import { DEFAULT_A4_FREQUENCY } from './constants';

const App: React.FC = () => {
  const [note, setNote] = useState<NoteDetails | null>(null);
  const [a4Frequency, setA4Frequency] = useState<number>(DEFAULT_A4_FREQUENCY);

  const onPitchDetected = useCallback((pitch: Pitch) => {
    const noteDetails = frequencyToNote(pitch.frequency, a4Frequency);
    setNote(noteDetails);
  }, [a4Frequency]);

  const { start, stop, isListening, error } = usePitchDetection(onPitchDetected);
  
  const handleStop = () => {
    stop();
    setNote(null);
  };

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col items-center justify-start pt-8 md:pt-12 p-4 text-white selection:bg-green-500/30">
      <header className="text-center mb-8">
        <h1 className="text-6xl font-thin text-gray-400 tracking-wider">TUNER</h1>
      </header>
      
      <main className="w-full max-w-2xl bg-gray-800/50 rounded-2xl shadow-2xl shadow-black/50 p-6 md:p-8 border border-gray-700">
        <TunerDisplay note={note} isListening={isListening} />
        <div className="mt-2 space-y-8">
          <FrequencyControl 
            a4Frequency={a4Frequency}
            setA4Frequency={setA4Frequency}
            isListening={isListening}
          />
          <Controls isListening={isListening} onStart={start} onStop={handleStop} error={error} />
        </div>
      </main>
    </div>
  );
};

export default App;