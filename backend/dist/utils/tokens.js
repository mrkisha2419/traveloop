import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
export function signAccessToken(payload) {
    const options = { expiresIn: env.JWT_ACCESS_EXPIRES_IN };
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, options);
}
export function signRefreshToken(userId) {
    const options = { expiresIn: env.JWT_REFRESH_EXPIRES_IN };
    return jwt.sign({ sub: userId }, env.JWT_REFRESH_SECRET, options);
}
export function verifyAccessToken(token) {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
}
export function verifyRefreshToken(token) {
    return jwt.verify(token, env.JWT_REFRESH_SECRET);
}
export function hashToken(token) {
    return crypto.createHash("sha256").update(token).digest("hex");
}
export function randomSlug() {
    return crypto.randomBytes(5).toString("hex");
}
