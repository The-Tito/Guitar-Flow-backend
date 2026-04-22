import { Router } from "express";
import { ApiController } from "../controllers/api.controller";

export function buildApiRoutes(controller: ApiController): Router {
  const router = Router();

  router.get("/health", (req, res) => controller.health(req, res));

  router.get("/api/keys", (req, res) => controller.listKeys(req, res));
  router.get("/api/keys/:keyId/chords", (req, res) => controller.listChordsByKey(req, res));

  router.get("/api/progressions", (req, res) => controller.listProgressions(req, res));
  router.post("/api/progressions", (req, res) => controller.createProgression(req, res));
  router.post("/api/progressions/:progressionId/transpose", (req, res) =>
    controller.transposeProgression(req, res)
  );

  router.post("/api/favorites/:progressionId", (req, res) => controller.addFavorite(req, res));
  router.delete("/api/favorites/:progressionId", (req, res) => controller.removeFavorite(req, res));

  return router;
}
