import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { usersRouter } from "./users.routes.js";
import { tripsRouter } from "./trips.routes.js";
import { searchRouter } from "./search.routes.js";
import { aiRouter } from "./ai.routes.js";
import { adminRouter } from "./admin.routes.js";

export const router = Router();

router.use("/auth", authRouter);
router.use("/users", usersRouter);
router.use("/trips", tripsRouter);
router.use("/search", searchRouter);
router.use("/ai", aiRouter);
router.use("/admin", adminRouter);
