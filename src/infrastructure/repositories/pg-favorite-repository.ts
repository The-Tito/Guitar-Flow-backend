import { FavoriteRepository } from "../../domain/repositories/favorite-repository";
import { DbSession } from "../../domain/repositories/db-session";

export class PgFavoriteRepository implements FavoriteRepository {
  async addFavorite(session: DbSession, userId: number, progressionId: number): Promise<void> {
    await session.query(
      `
      INSERT INTO Favorites (user_id, progression_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, progression_id) DO NOTHING
      `,
      [userId, progressionId]
    );
  }

  async removeFavorite(session: DbSession, userId: number, progressionId: number): Promise<void> {
    await session.query(
      `
      DELETE FROM Favorites
      WHERE user_id = $1
      AND progression_id = $2
      `,
      [userId, progressionId]
    );
  }
}
