
export interface Pitch {
  frequency: number;
  clarity: number;
}

export interface NoteDetails {
  name: string;
  octave: number;
  frequency: number;
  targetFrequency: number;
  cents: number;
}
