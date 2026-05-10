import { Router } from "express";
import { adminMiddleware } from "../middleware/admin.js";
import { authMiddleware } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { analytics, listUsers, tripsAnalytics } from "../services/admin.service.js";

export const adminRouter = Router();
adminRouter.use(authMiddleware, adminMiddleware);

adminRouter.get("/analytics", asyncHandler(async (_req, res) => {
  res.json(await analytics());
}));

adminRouter.get("/users", asyncHandler(async (_req, res) => {
  res.json(await listUsers());
}));

adminRouter.get("/trips", asyncHandler(async (_req, res) => {
  res.json(await tripsAnalytics());
}));
