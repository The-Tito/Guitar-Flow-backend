import cors from "cors";
import express from "express";
import helmet from "helmet";
import { AddFavoriteUseCase } from "../../application/use-cases/add-favorite.use-case";
import { CreateProgressionUseCase } from "../../application/use-cases/create-progression.use-case";
import { ListChordsByKeyUseCase } from "../../application/use-cases/list-chords-by-key.use-case";
import { ListKeysUseCase } from "../../application/use-cases/list-keys.use-case";
import { ListProgressionsUseCase } from "../../application/use-cases/list-progressions.use-case";
import { LoginUseCase } from "../../application/use-cases/login.use-case";
import { RegisterUseCase } from "../../application/use-cases/register.use-case";
import { RemoveFavoriteUseCase } from "../../application/use-cases/remove-favorite.use-case";
import { TransposeProgressionUseCase } from "../../application/use-cases/transpose-progression.use-case";
import { pgPool } from "../db/pg-pool";
import { PgSessionManager } from "../db/pg-session-manager";
import { PgCatalogRepository } from "../repositories/pg-catalog-repository";
import { PgFavoriteRepository } from "../repositories/pg-favorite-repository";
import { PgProgressionRepository } from "../repositories/pg-progression-repository";
import { PgUserRepository } from "../repositories/pg-user-repository";
import { ApiController } from "./controllers/api.controller";
import { AuthController } from "./controllers/auth.controller";
import { errorHandlerMiddleware } from "./middlewares/error-handler.middleware";
import { authMiddleware } from "./middlewares/auth.middleware";
import { buildApiRoutes } from "./routes/api.routes";
import { buildAuthRoutes } from "./routes/auth.routes";

export function buildApp() {
  const app = express();

  const sessions = new PgSessionManager(pgPool);
  const catalogRepository = new PgCatalogRepository();
  const progressionRepository = new PgProgressionRepository();
  const favoriteRepository = new PgFavoriteRepository();
  const userRepository = new PgUserRepository(pgPool);

  const listKeysUseCase = new ListKeysUseCase(sessions, catalogRepository);
  const listChordsByKeyUseCase = new ListChordsByKeyUseCase(sessions, catalogRepository);
  const listProgressionsUseCase = new ListProgressionsUseCase(sessions, progressionRepository);
  const createProgressionUseCase = new CreateProgressionUseCase(sessions, progressionRepository);
  const transposeProgressionUseCase = new TransposeProgressionUseCase(sessions, progressionRepository);
  const addFavoriteUseCase = new AddFavoriteUseCase(sessions, favoriteRepository);
  const removeFavoriteUseCase = new RemoveFavoriteUseCase(sessions, favoriteRepository);
  const registerUseCase = new RegisterUseCase(userRepository);
  const loginUseCase = new LoginUseCase(userRepository);

  const apiController = new ApiController(
    listKeysUseCase,
    listChordsByKeyUseCase,
    listProgressionsUseCase,
    createProgressionUseCase,
    transposeProgressionUseCase,
    addFavoriteUseCase,
    removeFavoriteUseCase
  );

  const authController = new AuthController(registerUseCase, loginUseCase);

  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(buildAuthRoutes(authController));
  app.use(buildApiRoutes(apiController, authMiddleware));
  app.use(errorHandlerMiddleware);

  return app;
}
