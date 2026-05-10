import { Router } from "express";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteAccount, getProfile, updateProfile, uploadProfilePhoto } from "../services/user.service.js";
import { AppError } from "../utils/errors.js";
export const usersRouter = Router();
usersRouter.use(authMiddleware);
usersRouter.get("/me", asyncHandler(async (req, res) => {
    res.json(await getProfile(req.user.id));
}));
usersRouter.patch("/me", validate(z.object({
    body: z.object({
        name: z.string().min(2).optional(),
        city: z.string().optional(),
        country: z.string().optional(),
        language: z.string().min(2).max(8).optional(),
        preferences: z.array(z.string()).optional()
    })
})), asyncHandler(async (req, res) => {
    res.json(await updateProfile(req.user.id, req.body));
}));
usersRouter.post("/me/photo", upload.single("photo"), asyncHandler(async (req, res) => {
    if (!req.file)
        throw new AppError("Photo is required", 400, "PHOTO_REQUIRED");
    res.json(await uploadProfilePhoto(req.user.id, req.file));
}));
usersRouter.delete("/me", asyncHandler(async (req, res) => {
    res.json(await deleteAccount(req.user.id));
}));
