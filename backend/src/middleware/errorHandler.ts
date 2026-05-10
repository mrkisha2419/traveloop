import { Prisma } from "@prisma/client";
import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { env } from "../config/env.js";
import { AppError } from "../utils/errors.js";

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(new AppError(`Route ${req.method} ${req.path} not found`, 404, "ROUTE_NOT_FOUND"));
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof ZodError) {
    return res.status(400).json({ message: "Validation failed", code: "VALIDATION_ERROR", issues: error.flatten() });
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    const statusCode = error.code === "P2002" ? 409 : 400;
    return res.status(statusCode).json({ message: "Database request failed", code: error.code, meta: error.meta });
  }

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({ message: error.message, code: error.code, details: error.details });
  }

  console.error(error);
  return res.status(500).json({
    message: "Internal server error",
    code: "INTERNAL_SERVER_ERROR",
    details: env.NODE_ENV === "production" ? undefined : error
  });
}
