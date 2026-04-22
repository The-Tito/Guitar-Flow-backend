import { Router } from "express";
import { asyncHandler } from "../../../shared/utils/async-handler";
import { AuthController } from "../controllers/auth.controller";

export function buildAuthRoutes(controller: AuthController): Router {
  const router = Router();

  router.post("/api/auth/register", asyncHandler((req, res) => controller.register(req, res)));
  router.post("/api/auth/login", asyncHandler((req, res) => controller.login(req, res)));

  return router;
}
