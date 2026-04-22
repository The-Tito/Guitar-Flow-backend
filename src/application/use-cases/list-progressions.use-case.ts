import { GroupedProgression } from "../../domain/entities/progression";
import { ProgressionRepository } from "../../domain/repositories/progression-repository";
import { SessionManager } from "../../domain/repositories/db-session";

export class ListProgressionsUseCase {
  constructor(
    private readonly sessions: SessionManager,
    private readonly progressionRepository: ProgressionRepository
  ) {}

  async execute(userId: number): Promise<GroupedProgression[]> {
    return this.sessions.withUserSession(userId, (session) => this.progressionRepository.listVisibleProgressions(session));
  }
}
