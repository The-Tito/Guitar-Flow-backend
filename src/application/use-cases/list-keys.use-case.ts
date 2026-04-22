import { MusicalKey } from "../../domain/entities/key";
import { CatalogRepository } from "../../domain/repositories/catalog-repository";
import { SessionManager } from "../../domain/repositories/db-session";

export class ListKeysUseCase {
  constructor(
    private readonly sessions: SessionManager,
    private readonly catalogRepository: CatalogRepository
  ) {}

  async execute(userId: number): Promise<MusicalKey[]> {
    return this.sessions.withUserSession(userId, (session) => this.catalogRepository.listKeys(session));
  }
}
