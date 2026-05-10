import bcrypt from "bcrypt";
import { addDays } from "date-fns";
import { AppError } from "../utils/errors.js";
import { prisma } from "../utils/prisma.js";
import { hashToken, signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/tokens.js";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatarUrl: true,
  city: true,
  country: true,
  language: true,
  preferences: true,
  createdAt: true
};

async function issueTokens(user: { id: string; email: string; role: "USER" | "ADMIN" }) {
  const accessToken = signAccessToken({ sub: user.id, email: user.email, role: user.role });
  const refreshToken = signRefreshToken(user.id);
  await prisma.refreshToken.create({
    data: {
      tokenHash: hashToken(refreshToken),
      userId: user.id,
      expiresAt: addDays(new Date(), 30)
    }
  });
  return { accessToken, refreshToken };
}

export async function registerUser(input: { name: string; email: string; password: string }) {
  const exists = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (exists) throw new AppError("Email is already registered", 409, "EMAIL_EXISTS");
  const passwordHash = await bcrypt.hash(input.password, 12);
  const user = await prisma.user.create({
    data: { name: input.name, email: input.email.toLowerCase(), passwordHash, preferences: [] },
    select: userSelect
  });
  const tokens = await issueTokens(user);
  return { user, ...tokens };
}

export async function loginUser(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email.toLowerCase() } });
  if (!user) throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  const tokens = await issueTokens(user);
  const { passwordHash: _passwordHash, ...safeUser } = user;
  return { user: safeUser, ...tokens };
}

export async function refreshSession(refreshToken: string) {
  const payload = verifyRefreshToken(refreshToken);
  const stored = await prisma.refreshToken.findUnique({ where: { tokenHash: hashToken(refreshToken) }, include: { user: true } });
  if (!stored || stored.revokedAt || stored.expiresAt < new Date() || stored.userId !== payload.sub) {
    throw new AppError("Invalid refresh token", 401, "INVALID_REFRESH_TOKEN");
  }
  await prisma.refreshToken.update({ where: { id: stored.id }, data: { revokedAt: new Date() } });
  const tokens = await issueTokens(stored.user);
  const { passwordHash: _passwordHash, ...safeUser } = stored.user;
  return { user: safeUser, ...tokens };
}

export async function logout(refreshToken?: string) {
  if (!refreshToken) return;
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(refreshToken), revokedAt: null },
    data: { revokedAt: new Date() }
  });
}

export async function forgotPassword(email: string) {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  return {
    sent: Boolean(user),
    message: "If that email exists, a password reset link will be sent."
  };
}
