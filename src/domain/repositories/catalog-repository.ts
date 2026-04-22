import { KeyChord } from "../entities/chord";
import { MusicalKey } from "../entities/key";
import { DbSession } from "./db-session";

export interface CatalogRepository {
  listKeys(session: DbSession): Promise<MusicalKey[]>;
  listChordsByKey(session: DbSession, keyId: number): Promise<KeyChord[]>;
}
