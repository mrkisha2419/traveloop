import { Router } from "express";
import { BudgetCategory, TripStatus, TripVisibility } from "@prisma/client";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { addStopActivity, removeStopActivity, updateStopActivity } from "../services/activity.service.js";
import { getBudgetBreakdown } from "../services/budget.service.js";
import { addChecklistItem, deleteChecklistItem, listChecklist, resetChecklist, updateChecklistItem } from "../services/checklist.service.js";
import { createExpense, deleteExpense, listExpenses, updateExpense } from "../services/expense.service.js";
import { createNote, deleteNote, listNotes, updateNote } from "../services/note.service.js";
import { addStop, deleteStop, reorderStops, updateStop } from "../services/stop.service.js";
import { createTrip, deleteTrip, getPublicTrip, getTrip, listTrips, shareTrip, updateTrip, uploadCover } from "../services/trip.service.js";
import { AppError } from "../utils/errors.js";

export const tripsRouter = Router();
const requiredParam = (value: string | undefined) => {
  if (!value) throw new AppError("Required route parameter is missing", 400, "MISSING_PARAM");
  return value;
};

tripsRouter.get("/public/:shareSlug", asyncHandler(async (req, res) => {
  res.json(await getPublicTrip(requiredParam(req.params.shareSlug)));
}));

tripsRouter.use(authMiddleware);

tripsRouter.get("/", validate(z.object({
  query: z.object({
    search: z.string().optional(),
    status: z.nativeEnum(TripStatus).optional(),
    sort: z.enum(["date", "budget"]).optional()
  })
})), asyncHandler(async (req, res) => {
  res.json(await listTrips(req.user!.id, req.query as never));
}));

tripsRouter.post("/", validate(z.object({
  body: z.object({
    title: z.string().min(2),
    description: z.string().optional(),
    startDate: z.string().datetime().or(z.string().date()),
    endDate: z.string().datetime().or(z.string().date()),
    budgetTotal: z.coerce.number().nonnegative(),
    currency: z.string().default("USD"),
    visibility: z.nativeEnum(TripVisibility).optional()
  })
})), asyncHandler(async (req, res) => {
  res.status(201).json(await createTrip(req.user!.id, req.body));
}));

tripsRouter.get("/:tripId", validate(z.object({ params: z.object({ tripId: z.string().uuid() }) })), asyncHandler(async (req, res) => {
  res.json(await getTrip(req.user!.id, requiredParam(req.params.tripId)));
}));

tripsRouter.patch("/:tripId", validate(z.object({
  params: z.object({ tripId: z.string().uuid() }),
  body: z.object({
    title: z.string().min(2).optional(),
    description: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    budgetTotal: z.coerce.number().nonnegative().optional(),
    visibility: z.nativeEnum(TripVisibility).optional(),
    status: z.nativeEnum(TripStatus).optional()
  })
})), asyncHandler(async (req, res) => {
  res.json(await updateTrip(req.user!.id, requiredParam(req.params.tripId), req.body));
}));

tripsRouter.delete("/:tripId", validate(z.object({ params: z.object({ tripId: z.string().uuid() }) })), asyncHandler(async (req, res) => {
  res.json(await deleteTrip(req.user!.id, requiredParam(req.params.tripId)));
}));

tripsRouter.post("/:tripId/share", validate(z.object({ params: z.object({ tripId: z.string().uuid() }) })), asyncHandler(async (req, res) => {
  res.json(await shareTrip(req.user!.id, requiredParam(req.params.tripId)));
}));

tripsRouter.post("/:tripId/cover", upload.single("cover"), validate(z.object({ params: z.object({ tripId: z.string().uuid() }) })), asyncHandler(async (req, res) => {
  if (!req.file) throw new AppError("Cover image is required", 400, "COVER_REQUIRED");
  res.json(await uploadCover(req.user!.id, requiredParam(req.params.tripId), req.file));
}));

tripsRouter.post("/:tripId/stops", validate(z.object({
  params: z.object({ tripId: z.string().uuid() }),
  body: z.object({
    cityId: z.string().uuid().optional(),
    title: z.string().min(2),
    startDate: z.string(),
    endDate: z.string()
  })
})), asyncHandler(async (req, res) => {
  res.status(201).json(await addStop(req.user!.id, requiredParam(req.params.tripId), req.body));
}));

tripsRouter.patch("/:tripId/stops/reorder", validate(z.object({
  params: z.object({ tripId: z.string().uuid() }),
  body: z.object({ stopIds: z.array(z.string().uuid()).min(1) })
})), asyncHandler(async (req, res) => {
  res.json(await reorderStops(req.user!.id, requiredParam(req.params.tripId), req.body.stopIds));
}));

tripsRouter.patch("/:tripId/stops/:stopId", validate(z.object({
  params: z.object({ tripId: z.string().uuid(), stopId: z.string().uuid() }),
  body: z.object({
    cityId: z.string().uuid().optional(),
    title: z.string().min(2).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    notes: z.string().optional()
  })
})), asyncHandler(async (req, res) => {
  res.json(await updateStop(req.user!.id, requiredParam(req.params.tripId), requiredParam(req.params.stopId), req.body));
}));

tripsRouter.delete("/:tripId/stops/:stopId", validate(z.object({ params: z.object({ tripId: z.string().uuid(), stopId: z.string().uuid() }) })), asyncHandler(async (req, res) => {
  res.json(await deleteStop(req.user!.id, requiredParam(req.params.tripId), requiredParam(req.params.stopId)));
}));

tripsRouter.post("/:tripId/stops/:stopId/activities", validate(z.object({
  params: z.object({ tripId: z.string().uuid(), stopId: z.string().uuid() }),
  body: z.object({
    activityId: z.string().uuid().optional(),
    title: z.string().min(2),
    description: z.string().optional(),
    startTime: z.string().optional(),
    durationMins: z.coerce.number().int().positive().optional(),
    cost: z.coerce.number().nonnegative().optional()
  })
})), asyncHandler(async (req, res) => {
  res.status(201).json(await addStopActivity(req.user!.id, requiredParam(req.params.tripId), requiredParam(req.params.stopId), req.body));
}));

tripsRouter.patch("/:tripId/activities/:activityId", validate(z.object({
  params: z.object({ tripId: z.string().uuid(), activityId: z.string().uuid() }),
  body: z.object({
    title: z.string().min(2).optional(),
    description: z.string().optional(),
    startTime: z.string().optional(),
    durationMins: z.coerce.number().int().positive().optional(),
    cost: z.coerce.number().nonnegative().optional(),
    order: z.coerce.number().int().nonnegative().optional()
  })
})), asyncHandler(async (req, res) => {
  res.json(await updateStopActivity(req.user!.id, requiredParam(req.params.tripId), requiredParam(req.params.activityId), req.body));
}));

tripsRouter.delete("/:tripId/activities/:activityId", validate(z.object({ params: z.object({ tripId: z.string().uuid(), activityId: z.string().uuid() }) })), asyncHandler(async (req, res) => {
  res.json(await removeStopActivity(req.user!.id, requiredParam(req.params.tripId), requiredParam(req.params.activityId)));
}));

tripsRouter.get("/:tripId/budget", validate(z.object({ params: z.object({ tripId: z.string().uuid() }) })), asyncHandler(async (req, res) => {
  res.json(await getBudgetBreakdown(req.user!.id, requiredParam(req.params.tripId)));
}));

tripsRouter.get("/:tripId/checklist", validate(z.object({ params: z.object({ tripId: z.string().uuid() }) })), asyncHandler(async (req, res) => {
  res.json(await listChecklist(req.user!.id, requiredParam(req.params.tripId)));
}));

tripsRouter.post("/:tripId/checklist", validate(z.object({
  params: z.object({ tripId: z.string().uuid() }),
  body: z.object({ category: z.string().min(2), label: z.string().min(1) })
})), asyncHandler(async (req, res) => {
  res.status(201).json(await addChecklistItem(req.user!.id, requiredParam(req.params.tripId), req.body));
}));

tripsRouter.patch("/:tripId/checklist/:itemId", validate(z.object({
  params: z.object({ tripId: z.string().uuid(), itemId: z.string().uuid() }),
  body: z.object({ category: z.string().optional(), label: z.string().optional(), packed: z.boolean().optional() })
})), asyncHandler(async (req, res) => {
  res.json(await updateChecklistItem(req.user!.id, requiredParam(req.params.tripId), requiredParam(req.params.itemId), req.body));
}));

tripsRouter.delete("/:tripId/checklist/:itemId", validate(z.object({ params: z.object({ tripId: z.string().uuid(), itemId: z.string().uuid() }) })), asyncHandler(async (req, res) => {
  res.json(await deleteChecklistItem(req.user!.id, requiredParam(req.params.tripId), requiredParam(req.params.itemId)));
}));

tripsRouter.post("/:tripId/checklist/reset", validate(z.object({ params: z.object({ tripId: z.string().uuid() }) })), asyncHandler(async (req, res) => {
  res.json(await resetChecklist(req.user!.id, requiredParam(req.params.tripId)));
}));

tripsRouter.get("/:tripId/notes", validate(z.object({ params: z.object({ tripId: z.string().uuid() }) })), asyncHandler(async (req, res) => {
  res.json(await listNotes(req.user!.id, requiredParam(req.params.tripId)));
}));

tripsRouter.post("/:tripId/notes", validate(z.object({
  params: z.object({ tripId: z.string().uuid() }),
  body: z.object({ title: z.string().min(1), body: z.string().min(1), stopId: z.string().uuid().optional() })
})), asyncHandler(async (req, res) => {
  res.status(201).json(await createNote(req.user!.id, requiredParam(req.params.tripId), req.body));
}));

tripsRouter.patch("/:tripId/notes/:noteId", validate(z.object({
  params: z.object({ tripId: z.string().uuid(), noteId: z.string().uuid() }),
  body: z.object({ title: z.string().optional(), body: z.string().optional(), stopId: z.string().uuid().nullable().optional() })
})), asyncHandler(async (req, res) => {
  res.json(await updateNote(req.user!.id, requiredParam(req.params.tripId), requiredParam(req.params.noteId), req.body));
}));

tripsRouter.delete("/:tripId/notes/:noteId", validate(z.object({ params: z.object({ tripId: z.string().uuid(), noteId: z.string().uuid() }) })), asyncHandler(async (req, res) => {
  res.json(await deleteNote(req.user!.id, requiredParam(req.params.tripId), requiredParam(req.params.noteId)));
}));

tripsRouter.get("/:tripId/expenses", validate(z.object({ params: z.object({ tripId: z.string().uuid() }) })), asyncHandler(async (req, res) => {
  res.json(await listExpenses(req.user!.id, requiredParam(req.params.tripId)));
}));

tripsRouter.post("/:tripId/expenses", validate(z.object({
  params: z.object({ tripId: z.string().uuid() }),
  body: z.object({
    title: z.string().min(1),
    category: z.nativeEnum(BudgetCategory),
    amount: z.coerce.number().nonnegative(),
    spentAt: z.string(),
    notes: z.string().optional()
  })
})), asyncHandler(async (req, res) => {
  res.status(201).json(await createExpense(req.user!.id, requiredParam(req.params.tripId), req.body));
}));

tripsRouter.patch("/:tripId/expenses/:expenseId", validate(z.object({
  params: z.object({ tripId: z.string().uuid(), expenseId: z.string().uuid() }),
  body: z.object({
    title: z.string().optional(),
    category: z.nativeEnum(BudgetCategory).optional(),
    amount: z.coerce.number().nonnegative().optional(),
    spentAt: z.string().optional(),
    notes: z.string().optional()
  })
})), asyncHandler(async (req, res) => {
  res.json(await updateExpense(req.user!.id, requiredParam(req.params.tripId), requiredParam(req.params.expenseId), req.body));
}));

tripsRouter.delete("/:tripId/expenses/:expenseId", validate(z.object({ params: z.object({ tripId: z.string().uuid(), expenseId: z.string().uuid() }) })), asyncHandler(async (req, res) => {
  res.json(await deleteExpense(req.user!.id, requiredParam(req.params.tripId), requiredParam(req.params.expenseId)));
}));
