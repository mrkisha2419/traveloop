import { AppError } from "../utils/errors.js";
import { prisma } from "../utils/prisma.js";
import { verifyAccessToken } from "../utils/tokens.js";
export async function authMiddleware(req, _res, next) {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;
    if (!token)
        return next(new AppError("Authentication required", 401, "AUTH_REQUIRED"));
    try {
        const payload = verifyAccessToken(token);
        const user = await prisma.user.findUnique({
            where: { id: payload.sub },
            select: { id: true, email: true, role: true, name: true }
        });
        if (!user)
            return next(new AppError("Invalid session", 401, "INVALID_SESSION"));
        req.user = user;
        return next();
    }
    catch {
        return next(new AppError("Invalid or expired token", 401, "INVALID_TOKEN"));
    }
}
