import { GroupedProgression } from "../entities/progression";
import { DbSession } from "./db-session";

export interface CreateProgressionInput {
  userId: number;
  workTitle: string;
  baseKeyId: number;
  chordIds: number[];
}

export interface TransposeProgressionInput {
  progressionId: number;
  semitonesShift: number;
  newTitle: string;
}

export interface ProgressionRepository {
  listVisibleProgressions(session: DbSession): Promise<GroupedProgression[]>;
  createFullProgression(session: DbSession, input: CreateProgressionInput): Promise<void>;
  transposeProgression(session: DbSession, input: TransposeProgressionInput): Promise<number>;
}
