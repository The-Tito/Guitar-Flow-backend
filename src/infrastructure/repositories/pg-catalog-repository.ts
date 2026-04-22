import { KeyChord } from "../../domain/entities/chord";
import { MusicalKey } from "../../domain/entities/key";
import { CatalogRepository } from "../../domain/repositories/catalog-repository";
import { DbSession } from "../../domain/repositories/db-session";

interface RawKey {
  id: number;
  key_name: string;
  scale_type: "Mayor" | "Menor";
  semitone_value: number;
}

interface RawKeyChord {
  chord_id: number;
  chord_name: string;
  chord_type: string;
  semitone_value: number;
  musical_degree: string;
  fretboard_url: string | null;
}

export class PgCatalogRepository implements CatalogRepository {
  async listKeys(session: DbSession): Promise<MusicalKey[]> {
    const { rows } = await session.query<RawKey>(
      `
      SELECT id, key_name, scale_type, semitone_value
      FROM Keys
      ORDER BY semitone_value, scale_type
      `
    );

    return rows.map((row) => ({
      id: row.id,
      keyName: row.key_name,
      scaleType: row.scale_type,
      semitoneValue: row.semitone_value
    }));
  }

  async listChordsByKey(session: DbSession, keyId: number): Promise<KeyChord[]> {
    const { rows } = await session.query<RawKeyChord>(
      `
      SELECT
        kc.chord_id,
        c.chord_name,
        c.chord_type,
        c.semitone_value,
        kc.musical_degree,
        c.fretboard_url
      FROM Key_Chords kc
      JOIN Chords c ON c.id = kc.chord_id
      WHERE kc.key_id = $1
      ORDER BY kc.id
      `,
      [keyId]
    );

    return rows.map((row) => ({
      chordId: row.chord_id,
      chordName: row.chord_name,
      chordType: row.chord_type,
      semitoneValue: row.semitone_value,
      musicalDegree: row.musical_degree,
      fretboardUrl: row.fretboard_url
    }));
  }
}
