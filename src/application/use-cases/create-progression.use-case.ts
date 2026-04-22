import {
  CreateProgressionInput,
  ProgressionRepository
} from "../../domain/repositories/progression-repository";
import { SessionManager } from "../../domain/repositories/db-session";

export class CreateProgressionUseCase {
  constructor(
    private readonly sessions: SessionManager,
    private readonly progressionRepository: ProgressionRepository
  ) {}

  async execute(userId: number, input: Omit<CreateProgressionInput, "userId">): Promise<void> {
    return this.sessions.withUserSession(userId, (session) =>
      this.progressionRepository.createFullProgression(session, {
        userId,
        ...input
      })
    );
  }
}
