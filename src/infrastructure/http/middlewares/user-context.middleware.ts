import { NextFunction, Request, Response } from "express";
import { env } from "../../../shared/config/env";

declare global {
  namespace Express {
    interface Request {
      currentUserId?: number;
    }
  }
}

export function userContextMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const fromHeader = req.header("x-user-id");
  const parsed = fromHeader ? Number(fromHeader) : env.APP_CURRENT_USER_ID;

  req.currentUserId = Number.isInteger(parsed) && parsed > 0 ? parsed : env.APP_CURRENT_USER_ID;
  next();
}
