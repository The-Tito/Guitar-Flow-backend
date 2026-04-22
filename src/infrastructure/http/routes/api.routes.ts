import { Router } from "express";
import { asyncHandler } from "../../../shared/utils/async-handler";
import { ApiController } from "../controllers/api.controller";

export function buildApiRoutes(controller: ApiController): Router {
  const router = Router();

  router.get("/health", asyncHandler((req, res) => controller.health(req, res)));

  router.get("/api/keys", asyncHandler((req, res) => controller.listKeys(req, res)));
  router.get("/api/keys/:keyId/chords", asyncHandler((req, res) => controller.listChordsByKey(req, res)));

  router.get("/api/progressions", asyncHandler((req, res) => controller.listProgressions(req, res)));
  router.post("/api/progressions", asyncHandler((req, res) => controller.createProgression(req, res)));
  router.post("/api/progressions/:progressionId/transpose", asyncHandler((req, res) =>
    controller.transposeProgression(req, res)
  ));

  router.post("/api/favorites/:progressionId", asyncHandler((req, res) => controller.addFavorite(req, res)));
  router.delete("/api/favorites/:progressionId", asyncHandler((req, res) => controller.removeFavorite(req, res)));

  return router;
}
