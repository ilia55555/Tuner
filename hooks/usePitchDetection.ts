import { useState, useEffect, useCallback, useRef } from 'react';
import type { Pitch } from '../types';
import { CLARITY_THRESHOLD } from '../constants';

/**
 * Implements the McLeod Pitch Method (MPM) to find the fundamental frequency of a signal.
 * This version uses a robust peak-picking method to avoid octave errors.
 * @param {Float32Array} buffer The audio buffer from the analyser node.
 * @param {number} sampleRate The sample rate of the audio context.
 * @returns {Pitch | null} The detected pitch (frequency and clarity) or null.
 */
const findFundamentalFrequency = (buffer: Float32Array, sampleRate: number): Pitch | null => {
    const bufferSize = buffer.length;
    const rms = Math.sqrt(buffer.reduce((sum, val) => sum + val * val, 0) / bufferSize);

    // 1. Check for enough signal
    if (rms < 0.01) return null;

    // 2. Normalized Square Difference Function (NSDF)
    const nsdf = new Float32Array(bufferSize).fill(0);
    
    // Set search range for periods corresponding to piano notes (A0 to C8)
    const minPeriod = Math.floor(sampleRate / 4200); 
    const maxPeriod = Math.ceil(sampleRate / 27);

    for (let tau = minPeriod; tau < maxPeriod; tau++) {
        let ac = 0;
        let m = 0;
        for (let i = 0; i < bufferSize - tau; i++) {
            ac += buffer[i] * buffer[i + tau];
            m += buffer[i] * buffer[i] + buffer[i + tau] * buffer[i + tau];
        }
        if (m > 0) {
            nsdf[tau] = (2 * ac) / m;
        }
    }

    // 3. Peak Picking using the standard MPM criteria to avoid octave errors.
    const peaks: Array<{pos: number, val: number}> = [];
    let globalMax = 0;

    // Find all local maxima and the global maximum value
    for (let tau = minPeriod; tau < maxPeriod; tau++) {
        if (nsdf[tau] > nsdf[tau - 1] && nsdf[tau] > nsdf[tau + 1]) {
            const peak = { pos: tau, val: nsdf[tau] };
            peaks.push(peak);
            if (peak.val > globalMax) {
                globalMax = peak.val;
            }
        }
    }

    if (peaks.length === 0) {
        return null;
    }

    // Find the first peak that is above a threshold relative to the global max.
    const K_THRESHOLD = 0.93; 
    let bestPos = -1;
    let bestVal = -1;

    for (const peak of peaks) {
        if (peak.val >= K_THRESHOLD * globalMax) {
            bestPos = peak.pos;
            bestVal = peak.val;
            break; // We've found the first qualifying peak
        }
    }

    // If no peak qualifies, it's likely an unpitched sound.
    if (bestPos === -1) {
        return null;
    }
    
    // 4. Parabolic interpolation for better accuracy of the peak position
    let better_tau = bestPos;
    if (bestPos > 0 && bestPos < nsdf.length - 1) {
        const s0 = nsdf[bestPos - 1];
        const s1 = nsdf[bestPos];
        const s2 = nsdf[bestPos + 1];
        const denominator = 2 * s1 - s2 - s0;
        if (denominator !== 0) {
            const adjustment = (s0 - s2) / (2 * denominator);
            better_tau += adjustment;
        }
    }
    
    if (better_tau <= 0) return null;

    const frequency = sampleRate / better_tau;
    
    // Clarity is the height of the selected peak
    const clarity = bestVal;

    return { frequency, clarity };
};


export const usePitchDetection = (onPitchDetected: (pitch: Pitch) => void) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserNodeRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const processAudio = useCallback(() => {
    if (!analyserNodeRef.current || !audioContextRef.current) return;
    
    const buffer = new Float32Array(analyserNodeRef.current.fftSize);
    analyserNodeRef.current.getFloatTimeDomainData(buffer);

    const pitch = findFundamentalFrequency(buffer, audioContextRef.current.sampleRate);
    
    if (pitch && pitch.clarity > CLARITY_THRESHOLD) {
      onPitchDetected(pitch);
    }

    animationFrameId.current = requestAnimationFrame(processAudio);
  }, [onPitchDetected]);

  const start = useCallback(async () => {
    try {
      if (isListening) return;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const context = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = context;
      
      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048; // Good balance of resolution and performance
      
      source.connect(analyser);
      analyserNodeRef.current = analyser;

      setIsListening(true);
      setError(null);
      animationFrameId.current = requestAnimationFrame(processAudio);

    } catch (err) {
      console.error("Error starting pitch detection:", err);
      setError("دسترسی به میکروفون لازم است. لطفا اجازه دسترسی بدهید.");
      setIsListening(false);
    }
  }, [isListening, processAudio]);

  const stop = useCallback(() => {
    if (!isListening) return;

    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    
    streamRef.current?.getTracks().forEach(track => track.stop());
    audioContextRef.current?.close();

    streamRef.current = null;
    audioContextRef.current = null;
    analyserNodeRef.current = null;
    
    setIsListening(false);
  }, [isListening]);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      stop();
    };
  }, [stop]);

  return { start, stop, isListening, error };
};