import { Router } from "express";
import { ActivityCategory } from "@prisma/client";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { searchActivities, searchCities } from "../services/search.service.js";
export const searchRouter = Router();
searchRouter.use(authMiddleware);
searchRouter.get("/cities", validate(z.object({
    query: z.object({
        q: z.string().optional(),
        region: z.string().optional(),
        maxCost: z.coerce.number().optional()
    })
})), asyncHandler(async (req, res) => {
    res.json(await searchCities(req.query.q, { region: req.query.region, maxCost: req.query.maxCost }));
}));
searchRouter.get("/activities", validate(z.object({
    query: z.object({
        q: z.string().optional(),
        cityId: z.string().uuid().optional(),
        category: z.nativeEnum(ActivityCategory).optional(),
        maxCost: z.coerce.number().optional(),
        maxDuration: z.coerce.number().optional()
    })
})), asyncHandler(async (req, res) => {
    res.json(await searchActivities(req.query.q, req.query));
}));
