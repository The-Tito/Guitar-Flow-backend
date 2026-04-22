export interface Chord {
  id: number;
  chordName: string;
  chordType: string;
  semitoneValue: number;
  fretboardUrl: string | null;
}

export interface KeyChord {
  chordId: number;
  chordName: string;
  chordType: string;
  semitoneValue: number;
  musicalDegree: string;
  fretboardUrl: string | null;
}
