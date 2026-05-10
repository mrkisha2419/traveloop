import type { Prisma } from "@prisma/client";
import { uploadBuffer } from "../utils/cloudinary.js";
import { prisma } from "../utils/prisma.js";

const profileSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  avatarUrl: true,
  city: true,
  country: true,
  language: true,
  preferences: true,
  createdAt: true,
  updatedAt: true
};

export function getProfile(userId: string) {
  return prisma.user.findUniqueOrThrow({ where: { id: userId }, select: profileSelect });
}

export function updateProfile(userId: string, input: { name?: string; city?: string; country?: string; language?: string; preferences?: Prisma.InputJsonValue }) {
  return prisma.user.update({
    where: { id: userId },
    data: input,
    select: profileSelect
  });
}

export async function uploadProfilePhoto(userId: string, file: Express.Multer.File) {
  const avatarUrl = await uploadBuffer(file.buffer, "traveloop/profiles");
  return prisma.user.update({ where: { id: userId }, data: { avatarUrl }, select: profileSelect });
}

export function deleteAccount(userId: string) {
  return prisma.user.delete({ where: { id: userId }, select: { id: true } });
}
