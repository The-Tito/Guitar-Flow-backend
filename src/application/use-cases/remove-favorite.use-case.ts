import { SessionManager } from "../../domain/repositories/db-session";
import { FavoriteRepository } from "../../domain/repositories/favorite-repository";

export class RemoveFavoriteUseCase {
  constructor(
    private readonly sessions: SessionManager,
    private readonly favoriteRepository: FavoriteRepository
  ) {}

  async execute(userId: number, progressionId: number): Promise<void> {
    return this.sessions.withUserSession(userId, (session) =>
      this.favoriteRepository.removeFavorite(session, userId, progressionId)
    );
  }
}
