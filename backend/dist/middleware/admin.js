import { AppError } from "../utils/errors.js";
export function adminMiddleware(req, _res, next) {
    if (req.user?.role !== "ADMIN")
        return next(new AppError("Admin access required", 403, "ADMIN_REQUIRED"));
    return next();
}
