import { DbSession } from "./db-session";

export interface FavoriteRepository {
  addFavorite(session: DbSession, userId: number, progressionId: number): Promise<void>;
  removeFavorite(session: DbSession, userId: number, progressionId: number): Promise<void>;
}
