import {
  GroupedProgression,
  ProgressionViewRow
} from "../../domain/entities/progression";
import {
  CreateProgressionInput,
  ProgressionRepository,
  TransposeProgressionInput
} from "../../domain/repositories/progression-repository";
import { DbSession } from "../../domain/repositories/db-session";

interface RawProgressionRow {
  progression_id: number;
  work_title: string;
  author: string;
  key_name: string;
  scale_type: string;
  order_position: number;
  chord_name: string;
  fretboard_url: string | null;
}

interface RawTransposeResult {
  new_progression_id: number;
}

export class PgProgressionRepository implements ProgressionRepository {
  async listVisibleProgressions(session: DbSession): Promise<GroupedProgression[]> {
    const { rows } = await session.query<RawProgressionRow>(
      `
      SELECT
        progression_id,
        work_title,
        author,
        key_name,
        scale_type,
        order_position,
        chord_name,
        fretboard_url
      FROM view_user_progressions
      ORDER BY progression_id, order_position
      `
    );

    const grouped = new Map<number, GroupedProgression>();

    for (const row of rows) {
      if (!grouped.has(row.progression_id)) {
        grouped.set(row.progression_id, {
          progressionId: row.progression_id,
          workTitle: row.work_title,
          author: row.author,
          keyName: row.key_name,
          scaleType: row.scale_type,
          chords: []
        });
      }

      grouped.get(row.progression_id)?.chords.push({
        orderPosition: row.order_position,
        chordName: row.chord_name,
        fretboardUrl: row.fretboard_url
      });
    }

    return Array.from(grouped.values());
  }

  async createFullProgression(session: DbSession, input: CreateProgressionInput): Promise<void> {
    await session.query(
      `
      CALL create_full_progression($1, $2, $3, $4::INT[])
      `,
      [input.userId, input.workTitle, input.baseKeyId, input.chordIds]
    );
  }

  async transposeProgression(session: DbSession, input: TransposeProgressionInput): Promise<number> {
    const { rows } = await session.query<RawTransposeResult>(
      `
      SELECT transpose_progression($1, $2, $3) AS new_progression_id
      `,
      [input.progressionId, input.semitonesShift, input.newTitle]
    );

    return rows[0].new_progression_id;
  }
}
