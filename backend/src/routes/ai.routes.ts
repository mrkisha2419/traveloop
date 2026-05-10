import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateItinerary, recommendDestinations, suggestPacking } from "../services/ai.service.js";
import { addChecklistItem } from "../services/checklist.service.js";

export const aiRouter = Router();
aiRouter.use(authMiddleware);
const requiredParam = (value: string | undefined) => {
  if (!value) throw new Error("Missing route parameter");
  return value;
};

aiRouter.post("/trips/:tripId/itinerary", validate(z.object({
  params: z.object({ tripId: z.string().uuid() }),
  body: z.object({ prompt: z.string().min(5), days: z.coerce.number().optional(), interests: z.array(z.string()).optional() })
})), asyncHandler(async (req, res) => {
  res.json(await generateItinerary(req.user!.id, requiredParam(req.params.tripId), req.body));
}));

aiRouter.post("/trips/:tripId/packing", validate(z.object({
  params: z.object({ tripId: z.string().uuid() }),
  body: z.object({ destination: z.string().optional(), days: z.coerce.number().optional(), season: z.string().optional(), activities: z.array(z.string()).optional(), persist: z.boolean().default(false) })
})), asyncHandler(async (req, res) => {
  const result = await suggestPacking(req.body);
  if (req.body.persist && Array.isArray((result as { items?: unknown[] }).items)) {
    for (const item of (result as { items: Array<{ category: string; label: string }> }).items) {
      await addChecklistItem(req.user!.id, requiredParam(req.params.tripId), item);
    }
  }
  res.json(result);
}));

aiRouter.post("/destinations", validate(z.object({
  body: z.object({ interests: z.array(z.string()).min(1), budget: z.coerce.number().optional(), region: z.string().optional() })
})), asyncHandler(async (req, res) => {
  res.json(await recommendDestinations(req.body));
}));
