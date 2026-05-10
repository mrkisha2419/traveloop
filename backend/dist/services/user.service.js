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
export function getProfile(userId) {
    return prisma.user.findUniqueOrThrow({ where: { id: userId }, select: profileSelect });
}
export function updateProfile(userId, input) {
    return prisma.user.update({
        where: { id: userId },
        data: input,
        select: profileSelect
    });
}
export async function uploadProfilePhoto(userId, file) {
    const avatarUrl = await uploadBuffer(file.buffer, "traveloop/profiles");
    return prisma.user.update({ where: { id: userId }, data: { avatarUrl }, select: profileSelect });
}
export function deleteAccount(userId) {
    return prisma.user.delete({ where: { id: userId }, select: { id: true } });
}
