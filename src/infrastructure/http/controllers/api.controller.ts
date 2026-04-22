import { Request, Response } from "express";
import { z } from "zod";
import { AddFavoriteUseCase } from "../../../application/use-cases/add-favorite.use-case";
import { CreateProgressionUseCase } from "../../../application/use-cases/create-progression.use-case";
import { ListChordsByKeyUseCase } from "../../../application/use-cases/list-chords-by-key.use-case";
import { ListKeysUseCase } from "../../../application/use-cases/list-keys.use-case";
import { ListProgressionsUseCase } from "../../../application/use-cases/list-progressions.use-case";
import { RemoveFavoriteUseCase } from "../../../application/use-cases/remove-favorite.use-case";
import { TransposeProgressionUseCase } from "../../../application/use-cases/transpose-progression.use-case";

const createProgressionSchema = z.object({
  workTitle: z.string().min(1),
  baseKeyId: z.number().int().positive(),
  chordIds: z.array(z.number().int().positive()).min(1)
});

const transposeSchema = z.object({
  semitonesShift: z.number().int().min(-11).max(11),
  newTitle: z.string().min(1)
});

export class ApiController {
  constructor(
    private readonly listKeysUseCase: ListKeysUseCase,
    private readonly listChordsByKeyUseCase: ListChordsByKeyUseCase,
    private readonly listProgressionsUseCase: ListProgressionsUseCase,
    private readonly createProgressionUseCase: CreateProgressionUseCase,
    private readonly transposeProgressionUseCase: TransposeProgressionUseCase,
    private readonly addFavoriteUseCase: AddFavoriteUseCase,
    private readonly removeFavoriteUseCase: RemoveFavoriteUseCase
  ) {}

  async health(_req: Request, res: Response): Promise<void> {
    res.json({ status: "ok" });
  }

  async listKeys(req: Request, res: Response): Promise<void> {
    const data = await this.listKeysUseCase.execute(req.currentUserId!);
    res.json(data);
  }

  async listChordsByKey(req: Request, res: Response): Promise<void> {
    const keyId = Number(req.params.keyId);
    const data = await this.listChordsByKeyUseCase.execute(req.currentUserId!, keyId);
    res.json(data);
  }

  async listProgressions(req: Request, res: Response): Promise<void> {
    const data = await this.listProgressionsUseCase.execute(req.currentUserId!);
    res.json(data);
  }

  async createProgression(req: Request, res: Response): Promise<void> {
    const payload = createProgressionSchema.parse(req.body);

    await this.createProgressionUseCase.execute(req.currentUserId!, payload);
    res.status(201).json({ message: "Progression created" });
  }

  async transposeProgression(req: Request, res: Response): Promise<void> {
    const progressionId = Number(req.params.progressionId);
    const payload = transposeSchema.parse(req.body);

    const newProgressionId = await this.transposeProgressionUseCase.execute(req.currentUserId!, {
      progressionId,
      semitonesShift: payload.semitonesShift,
      newTitle: payload.newTitle
    });

    res.status(201).json({ newProgressionId });
  }

  async addFavorite(req: Request, res: Response): Promise<void> {
    const progressionId = Number(req.params.progressionId);

    await this.addFavoriteUseCase.execute(req.currentUserId!, progressionId);
    res.status(201).json({ message: "Favorite added" });
  }

  async removeFavorite(req: Request, res: Response): Promise<void> {
    const progressionId = Number(req.params.progressionId);

    await this.removeFavoriteUseCase.execute(req.currentUserId!, progressionId);
    res.status(204).send();
  }
}
