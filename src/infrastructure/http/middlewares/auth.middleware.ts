import { NextFunction, Request, Response } from "express";
import { AppError } from "../../../shared/errors/app-error";
import { verifyToken } from "../../../shared/utils/jwt";

declare global {
  namespace Express {
    interface Request {
      currentUserId?: number;
    }
  }
}

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return next(new AppError("Token de autenticación requerido", 401));
  }

  const token = header.slice(7);

  try {
    const payload = verifyToken(token);
    req.currentUserId = payload.userId;
    next();
  } catch {
    next(new AppError("Token inválido o expirado", 401));
  }
}
