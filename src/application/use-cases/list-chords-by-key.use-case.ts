import { KeyChord } from "../../domain/entities/chord";
import { CatalogRepository } from "../../domain/repositories/catalog-repository";
import { SessionManager } from "../../domain/repositories/db-session";

export class ListChordsByKeyUseCase {
  constructor(
    private readonly sessions: SessionManager,
    private readonly catalogRepository: CatalogRepository
  ) {}

  async execute(userId: number, keyId: number): Promise<KeyChord[]> {
    return this.sessions.withUserSession(userId, (session) => this.catalogRepository.listChordsByKey(session, keyId));
  }
}
