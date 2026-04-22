import { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { AppError } from "../../../shared/errors/app-error";

export function errorHandlerMiddleware(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Validation error",
      issues: err.issues
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  res.status(500).json({ message: "Internal server error" });
}
