import { Router } from "express";
import { z } from "zod";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { forgotPassword, loginUser, logout, refreshSession, registerUser } from "../services/auth.service.js";

export const authRouter = Router();

const authSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8)
  })
});

authRouter.post("/register", validate(authSchema.extend({ body: authSchema.shape.body.extend({ name: z.string().min(2) }) })), asyncHandler(async (req, res) => {
  const result = await registerUser(req.body);
  res.status(201).json(result);
}));

authRouter.post("/login", validate(authSchema), asyncHandler(async (req, res) => {
  res.json(await loginUser(req.body));
}));

authRouter.post("/refresh", validate(z.object({ body: z.object({ refreshToken: z.string().min(20) }) })), asyncHandler(async (req, res) => {
  res.json(await refreshSession(req.body.refreshToken));
}));

authRouter.post("/logout", validate(z.object({ body: z.object({ refreshToken: z.string().optional() }) })), asyncHandler(async (req, res) => {
  await logout(req.body.refreshToken);
  res.status(204).send();
}));

authRouter.post("/forgot-password", validate(z.object({ body: z.object({ email: z.string().email() }) })), asyncHandler(async (req, res) => {
  res.json(await forgotPassword(req.body.email));
}));
