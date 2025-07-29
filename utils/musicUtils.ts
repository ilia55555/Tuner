import { NOTE_NAMES } from '../constants.ts';
import type { NoteDetails } from '../types.ts';

export function frequencyToNote(frequency: number, a4Frequency: number): NoteDetails | null {
  if (frequency <= 0) return null;

  // Use the standard formula to convert frequency to a piano key number.
  // A4 is key 49 on an 88-key piano, which is our reference.
  const noteNum = 12 * Math.log2(frequency / a4Frequency) + 49;
  const roundedNoteNum = Math.round(noteNum);

  // Check if the note is within the standard 88-key piano range.
  if (roundedNoteNum < 1 || roundedNoteNum > 88) {
      return null;
  }
  
  const targetFrequency = a4Frequency * Math.pow(2, (roundedNoteNum - 49) / 12);
  const cents = 1200 * Math.log2(frequency / targetFrequency);

  const noteIndex = (roundedNoteNum + 8) % 12;
  const octave = Math.floor((roundedNoteNum + 8) / 12);

  return {
    name: NOTE_NAMES[noteIndex],
    octave: octave,
    frequency: frequency,
    targetFrequency: targetFrequency,
    cents: cents,
  };
}