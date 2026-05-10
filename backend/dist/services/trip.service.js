import slugify from "slugify";
import { BudgetCategory } from "@prisma/client";
import { AppError, notFound } from "../utils/errors.js";
import { prisma } from "../utils/prisma.js";
import { randomSlug } from "../utils/tokens.js";
import { uploadBuffer } from "../utils/cloudinary.js";
export const tripInclude = {
    stops: { orderBy: { order: "asc" }, include: { city: true, activities: { orderBy: { order: "asc" }, include: { activity: true } } } },
    budgets: true,
    checklist: { orderBy: [{ category: "asc" }, { order: "asc" }] },
    notes: { orderBy: { updatedAt: "desc" } },
    expenses: { orderBy: { spentAt: "desc" } }
};
export function listTrips(userId, filters) {
    return prisma.trip.findMany({
        where: {
            userId,
            status: filters.status,
            OR: filters.search ? [
                { title: { contains: filters.search, mode: "insensitive" } },
                { description: { contains: filters.search, mode: "insensitive" } }
            ] : undefined
        },
        orderBy: filters.sort === "budget" ? { budgetTotal: "desc" } : { startDate: "asc" },
        include: { stops: { take: 3, orderBy: { order: "asc" }, include: { city: true } }, budgets: true, expenses: true }
    });
}
export async function getTrip(userId, tripId) {
    const trip = await prisma.trip.findFirst({ where: { id: tripId, userId }, include: tripInclude });
    if (!trip)
        throw notFound("Trip");
    return trip;
}
export function getPublicTrip(shareSlug) {
    return prisma.trip.findFirstOrThrow({
        where: { shareSlug, visibility: "PUBLIC" },
        include: { ...tripInclude, user: { select: { id: true, name: true, avatarUrl: true } } }
    });
}
export async function createTrip(userId, input) {
    const startDate = new Date(input.startDate);
    const endDate = new Date(input.endDate);
    if (endDate < startDate)
        throw new AppError("End date must be after start date", 400, "INVALID_DATE_RANGE");
    return prisma.trip.create({
        data: {
            userId,
            title: input.title,
            description: input.description,
            startDate,
            endDate,
            budgetTotal: input.budgetTotal,
            currency: input.currency ?? "USD",
            visibility: input.visibility ?? "PRIVATE",
            budgets: {
                create: Object.values(BudgetCategory).map((category) => ({
                    category,
                    planned: Math.round((input.budgetTotal / Object.values(BudgetCategory).length) * 100) / 100
                }))
            }
        },
        include: tripInclude
    });
}
export async function updateTrip(userId, tripId, input) {
    await getTrip(userId, tripId);
    return prisma.trip.update({
        where: { id: tripId },
        data: {
            title: input.title,
            description: input.description,
            startDate: input.startDate ? new Date(input.startDate) : undefined,
            endDate: input.endDate ? new Date(input.endDate) : undefined,
            budgetTotal: input.budgetTotal,
            visibility: input.visibility,
            status: input.status
        },
        include: tripInclude
    });
}
export async function deleteTrip(userId, tripId) {
    await getTrip(userId, tripId);
    return prisma.trip.delete({ where: { id: tripId }, select: { id: true } });
}
export async function shareTrip(userId, tripId) {
    const trip = await getTrip(userId, tripId);
    const base = slugify(trip.title, { lower: true, strict: true });
    return prisma.trip.update({
        where: { id: tripId },
        data: { visibility: "PUBLIC", shareSlug: trip.shareSlug ?? `${base}-${randomSlug()}` },
        include: tripInclude
    });
}
export async function uploadCover(userId, tripId, file) {
    await getTrip(userId, tripId);
    const coverUrl = await uploadBuffer(file.buffer, "traveloop/covers");
    return prisma.trip.update({ where: { id: tripId }, data: { coverUrl }, include: tripInclude });
}
