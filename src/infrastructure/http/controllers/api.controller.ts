import { Request, Response } from "express";
import { z } from "zod";
import { AddFavoriteUseCase } from "../../../application/use-cases/add-favorite.use-case";
import { CreateProgressionUseCase } from "../../../application/use-cases/create-progression.use-case";
import { ListChordsByKeyUseCase } from "../../../application/use-cases/list-chords-by-key.use-case";
import { ListKeysUseCase } from "../../../application/use-cases/list-keys.use-case";
import { ListProgressionsUseCase } from "../../../application/use-cases/list-progressions.use-case";
import { RemoveFavoriteUseCase } from "../../../application/use-cases/remove-favorite.use-case";
import { TransposeProgressionUseCase } from "../../../application/use-cases/transpose-progression.use-case";

// Esquemas de validación
const pathIdSchema = z.coerce.number().int().positive();

const createProgressionSchema = z.object({
  workTitle: z.string().min(1),
  baseKeyId: z.number().int().positive(),
  chordIds: z.array(z.number().int().positive()).min(1),
});

const transposeSchema = z.object({
  semitonesShift: z.number().int().min(-11).max(11),
  newTitle: z.string().min(1),
});

export class ApiController {
  constructor(
    private readonly listKeysUseCase: ListKeysUseCase,
    private readonly listChordsByKeyUseCase: ListChordsByKeyUseCase,
    private readonly listProgressionsUseCase: ListProgressionsUseCase,
    private readonly createProgressionUseCase: CreateProgressionUseCase,
    private readonly transposeProgressionUseCase: TransposeProgressionUseCase,
    private readonly addFavoriteUseCase: AddFavoriteUseCase,
    private readonly removeFavoriteUseCase: RemoveFavoriteUseCase,
  ) {}

  // Helper para centralizar la respuesta de errores
  private handleError(res: Response, error: any, context: string) {
    console.error(`❌ Error en ${context}:`, error);

    if (error instanceof z.ZodError) {
      return res
        .status(400)
        .json({ message: "Validation error", issues: error.issues });
    }

    // Para errores de RLS o de Base de Datos
    return res.status(500).json({
      message: "Internal server error",
      context,
      debug: error.message,
    });
  }

  health(_req: Request, res: Response): void {
    res.json({ status: "ok" });
  }

  async listKeys(req: Request, res: Response): Promise<void> {
    try {
      const data = await this.listKeysUseCase.execute(req.currentUserId!);
      res.json(data);
    } catch (error) {
      this.handleError(res, error, "listKeys");
    }
  }

  async listChordsByKey(req: Request, res: Response): Promise<void> {
    try {
      const keyId = pathIdSchema.parse(req.params.keyId);
      const data = await this.listChordsByKeyUseCase.execute(
        req.currentUserId!,
        keyId,
      );
      res.json(data);
    } catch (error) {
      this.handleError(res, error, "listChordsByKey");
    }
  }

  async listProgressions(req: Request, res: Response): Promise<void> {
    try {
      const data = await this.listProgressionsUseCase.execute(
        req.currentUserId!,
      );
      res.json(data);
    } catch (error) {
      this.handleError(res, error, "listProgressions");
    }
  }

  async createProgression(req: Request, res: Response): Promise<void> {
    try {
      const { workTitle, baseKeyId, chordIds } = createProgressionSchema.parse(
        req.body,
      );
      await this.createProgressionUseCase.execute(req.currentUserId!, {
        workTitle,
        baseKeyId,
        chordIds,
      });
      res.status(201).json({ message: "Progression created" });
    } catch (error) {
      this.handleError(res, error, "createProgression");
    }
  }

  async transposeProgression(req: Request, res: Response): Promise<void> {
    try {
      const progressionId = pathIdSchema.parse(req.params.progressionId);
      const payload = transposeSchema.parse(req.body);
      const newProgressionId = await this.transposeProgressionUseCase.execute(
        req.currentUserId!,
        {
          progressionId,
          semitonesShift: payload.semitonesShift,
          newTitle: payload.newTitle,
        },
      );
      res.status(201).json({ newProgressionId });
    } catch (error) {
      this.handleError(res, error, "transposeProgression");
    }
  }

  async addFavorite(req: Request, res: Response): Promise<void> {
    try {
      const progressionId = pathIdSchema.parse(req.params.progressionId);
      await this.addFavoriteUseCase.execute(req.currentUserId!, progressionId);
      res.status(201).json({ message: "Favorite added" });
    } catch (error) {
      this.handleError(res, error, "addFavorite");
    }
  }

  async removeFavorite(req: Request, res: Response): Promise<void> {
    try {
      const progressionId = pathIdSchema.parse(req.params.progressionId);
      await this.removeFavoriteUseCase.execute(
        req.currentUserId!,
        progressionId,
      );
      res.status(204).send();
    } catch (error) {
      this.handleError(res, error, "removeFavorite");
    }
  }
}
