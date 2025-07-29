import React from 'react';

interface FrequencyControlProps {
  a4Frequency: number;
  setA4Frequency: React.Dispatch<React.SetStateAction<number>>;
  isListening: boolean;
}

const FrequencyControl: React.FC<FrequencyControlProps> = ({ a4Frequency, setA4Frequency, isListening }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value > 0) {
      setA4Frequency(value);
    }
  };

  const stepChange = (amount: number) => {
      setA4Frequency(prev => parseFloat((prev + amount).toFixed(1)));
  };

  return (
    <div className="flex items-center justify-center space-x-2 rtl:space-x-reverse text-gray-300">
      <label htmlFor="a4-freq" className="font-semibold text-lg">A4:</label>
      <button 
        onClick={() => stepChange(-1)} 
        disabled={isListening}
        className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-bold"
        aria-label="کاهش فرکانس به اندازه ۱ هرتز"
      >
        -
      </button>
      <input
        type="number"
        id="a4-freq"
        value={a4Frequency.toFixed(1)}
        onChange={handleChange}
        disabled={isListening}
        className="w-28 text-center bg-gray-900 border border-gray-600 rounded-md p-2 text-xl focus:ring-2 focus:ring-green-500 focus:outline-none disabled:opacity-50"
        step="0.1"
      />
      <button 
        onClick={() => stepChange(1)} 
        disabled={isListening}
        className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-bold"
        aria-label="افزایش فرکانس به اندازه ۱ هرتز"
      >
        +
      </button>
      <span className="font-mono text-lg">Hz</span>
    </div>
  );
};

export default FrequencyControl;