import React from 'react';
import type { NoteDetails } from '../types.ts';
import { CENTS_RANGE } from '../constants.ts';

interface TunerDisplayProps {
  note: NoteDetails | null;
  isListening: boolean;
}

// Define the gauge's angular spread. Total arc will be GAUGE_ARC_DEGREES * 2.
// Increasing this to 75 creates a wider 150-degree arc, spacing out the numbers.
const GAUGE_ARC_DEGREES = 75;
const R = 90;
const CENTER_X = 100;
const CENTER_Y = 100;

// Calculate SVG path for the background arc dynamically based on the spread
const startAngleRad = (-GAUGE_ARC_DEGREES - 90) * (Math.PI / 180);
const endAngleRad = (GAUGE_ARC_DEGREES - 90) * (Math.PI / 180);

const x_start = CENTER_X + R * Math.cos(startAngleRad);
const y_start = CENTER_Y + R * Math.sin(startAngleRad);
const x_end = CENTER_X + R * Math.cos(endAngleRad);
const y_end = CENTER_Y + R * Math.sin(endAngleRad);

const largeArcFlag = GAUGE_ARC_DEGREES * 2 > 180 ? 1 : 0;

const arcPath = `M ${x_start.toFixed(2)} ${y_start.toFixed(2)} A ${R} ${R} 0 ${largeArcFlag} 1 ${x_end.toFixed(2)} ${y_end.toFixed(2)}`;


const TunerDisplay: React.FC<TunerDisplayProps> = ({ note, isListening }) => {
  const inTune = note ? Math.abs(note.cents) < 2 : false;

  const centsToDegrees = (cents: number) => {
    const clampedCents = Math.max(-CENTS_RANGE, Math.min(CENTS_RANGE, cents));
    // Map the cents value to a rotation in degrees within our defined arc
    return (clampedCents / CENTS_RANGE) * GAUGE_ARC_DEGREES;
  };

  const rotation = note ? centsToDegrees(note.cents) : 0;

  const getCentsColor = (cents: number) => {
    if (Math.abs(cents) < 2) return 'text-green-400';
    if (Math.abs(cents) < 10) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getNeedleColorClass = (cents: number) => {
    if (Math.abs(cents) < 2) return 'stroke-green-400';
    if (Math.abs(cents) < 10) return 'stroke-yellow-400';
    return 'stroke-red-400';
  };
  
  const needleColorClass = note ? getNeedleColorClass(note.cents) : 'stroke-gray-500';

  const Ticks = () => {
    const ticks = [];
    
    // Loop for all ticks from -50 to +50 to create a detailed protractor-like scale
    for (let cents = -50; cents <= 50; cents++) {
      const isMajorTick = cents % 10 === 0; // A major tick every 10 cents
      
      const angleRad = ((cents / 50) * GAUGE_ARC_DEGREES - 90) * (Math.PI / 180);
      
      // Minor ticks are shorter than major ones
      const tickLength = isMajorTick ? 12 : 6; 
      const x1 = CENTER_X + R * Math.cos(angleRad);
      const y1 = CENTER_Y + R * Math.sin(angleRad);
      const x2 = CENTER_X + (R - tickLength) * Math.cos(angleRad);
      const y2 = CENTER_Y + (R - tickLength) * Math.sin(angleRad);
      
      ticks.push(
        <line
          key={`tick-${cents}`}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          // The center (0) tick glows green when in tune
          stroke={(isMajorTick && cents === 0 && inTune) ? "#4ade80" : "#6b7280"} 
          strokeWidth={isMajorTick ? "1.5" : "0.75"} // Major ticks are thicker
        />
      );
      
      // Add text labels only for major ticks
      if (isMajorTick) {
          const textR = R - tickLength - 8; // Position text labels just inside the major ticks
          const textX = CENTER_X + textR * Math.cos(angleRad);
          const textY = CENTER_Y + textR * Math.sin(angleRad) + 2; // small vertical adjustment
          
          ticks.push(
            <text
              key={`label-${cents}`}
              x={textX}
              y={textY}
              textAnchor="middle"
              dominantBaseline="central"
              fill="#9ca3af"
              fontSize="9" // Reduced font size for a cleaner look
              fontFamily="monospace" // Use monospace for consistent number/minus-sign rendering
              fontWeight="bold"
              direction="ltr" // Force LTR to ensure correct minus sign placement
            >
              {cents}
            </text>
          );
      }
    }
    return <g>{ticks}</g>;
  };

  return (
    <div className="flex flex-col items-center justify-center w-full mx-auto p-4 text-white">
      {/* Digital Readout */}
      <div className="text-center mb-4 h-48 flex flex-col justify-center items-center">
        {note ? (
          <>
            <div className="flex items-baseline justify-center">
              <span className={`text-9xl font-bold transition-colors ${inTune ? 'text-green-400' : 'text-gray-200'}`}>{note.name}</span>
              <span className="text-5xl text-gray-400 ml-2">{note.octave}</span>
            </div>
            <div className={`text-3xl font-mono ${getCentsColor(note.cents)}`}>
              {note.cents >= 0 ? '+' : ''}{note.cents.toFixed(1)}
            </div>
            <div className="text-xl text-gray-500 font-mono mt-1">
              {note.frequency.toFixed(2)} Hz
            </div>
          </>
        ) : (
           isListening ? 
           <div className="text-7xl text-gray-600 font-mono">...</div> :
           <div className="text-7xl text-gray-700 font-mono">- - -</div>
        )}
      </div>

      {/* SVG Tuner Gauge */}
      <div className="w-full h-52 relative">
        <svg viewBox="0 0 200 110" className="w-full h-full">
          <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
           </defs>
          {/* Main Arc */}
          <path
            d={arcPath}
            stroke="#374151"
            strokeWidth="4"
            fill="none"
            strokeLinecap="round"
          />

          <Ticks />

          {/* Needle */}
          {isListening && (
             <g style={{ transformOrigin: '100px 100px', transform: `rotate(${rotation}deg)` }}>
                <line
                    x1="100"
                    y1="100"
                    x2="100"
                    y2="20"
                    className={`${needleColorClass} transition-transform duration-200 ease-linear`}
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    filter={inTune ? "url(#glow)" : "none"}
                />
             </g>
          )}

           {/* Needle Base */}
           <circle cx="100" cy="100" r="5" fill="#1f2937" stroke="#4b5563" strokeWidth="2" />
        </svg>
      </div>
    </div>
  );
};

export default TunerDisplay;