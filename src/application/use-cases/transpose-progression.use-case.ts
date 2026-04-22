import {
  ProgressionRepository,
  TransposeProgressionInput
} from "../../domain/repositories/progression-repository";
import { SessionManager } from "../../domain/repositories/db-session";

export class TransposeProgressionUseCase {
  constructor(
    private readonly sessions: SessionManager,
    private readonly progressionRepository: ProgressionRepository
  ) {}

  async execute(userId: number, input: TransposeProgressionInput): Promise<number> {
    return this.sessions.withUserSession(userId, (session) =>
      this.progressionRepository.transposeProgression(session, input)
    );
  }
}
