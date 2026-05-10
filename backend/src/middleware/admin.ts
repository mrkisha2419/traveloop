import type { NextFunction, Request, Response } from "express";
import { AppError } from "../utils/errors.js";

export function adminMiddleware(req: Request, _res: Response, next: NextFunction) {
  if (req.user?.role !== "ADMIN") return next(new AppError("Admin access required", 403, "ADMIN_REQUIRED"));
  return next();
}
