export interface ProgressionStep {
  orderPosition: number;
  chordName: string;
  fretboardUrl: string | null;
}

export interface ProgressionViewRow {
  progressionId: number;
  workTitle: string;
  author: string;
  keyName: string;
  scaleType: string;
  orderPosition: number;
  chordName: string;
  fretboardUrl: string | null;
}

export interface GroupedProgression {
  progressionId: number;
  workTitle: string;
  author: string;
  keyName: string;
  scaleType: string;
  chords: ProgressionStep[];
}
