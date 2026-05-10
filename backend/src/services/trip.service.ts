import slugify from "slugify";
import { BudgetCategory, TripVisibility } from "@prisma/client";
import { AppError, notFound } from "../utils/errors.js";
import { prisma } from "../utils/prisma.js";
import { randomSlug } from "../utils/tokens.js";
import { uploadBuffer } from "../utils/cloudinary.js";

export const tripInclude = {
  stops: { orderBy: { order: "asc" as const }, include: { city: true, activities: { orderBy: { order: "asc" as const }, include: { activity: true } } } },
  budgets: true,
  checklist: { orderBy: [{ category: "asc" as const }, { order: "asc" as const }] },
  notes: { orderBy: { updatedAt: "desc" as const } },
  expenses: { orderBy: { spentAt: "desc" as const } }
};

export function listTrips(userId: string, filters: { search?: string; status?: string; sort?: string }) {
  return prisma.trip.findMany({
    where: {
      userId,
      status: filters.status as never,
      OR: filters.search ? [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } }
      ] : undefined
    },
    orderBy: filters.sort === "budget" ? { budgetTotal: "desc" } : { startDate: "asc" },
    include: { stops: { take: 3, orderBy: { order: "asc" }, include: { city: true } }, budgets: true, expenses: true }
  });
}

export async function getTrip(userId: string, tripId: string) {
  const trip = await prisma.trip.findFirst({ where: { id: tripId, userId }, include: tripInclude });
  if (!trip) throw notFound("Trip");
  return trip;
}

export async function getPublicTrip(shareSlug: string) {
  return prisma.trip.findFirstOrThrow({
    where: { shareSlug, visibility: "PUBLIC" },
    include: { ...tripInclude, user: { select: { id: true, name: true, avatarUrl: true } } }
  });
}


export async function createTrip(userId: string, input: {
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  budgetTotal: number;
  currency?: string;
  visibility?: "PRIVATE" | "PUBLIC";
}) {
  const startDate = new Date(input.startDate);
  const endDate = new Date(input.endDate);
  if (endDate < startDate) throw new AppError("End date must be after start date", 400, "INVALID_DATE_RANGE");

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

export async function updateTrip(userId: string, tripId: string, input: Record<string, unknown>) {
  await getTrip(userId, tripId);
  return prisma.trip.update({
    where: { id: tripId },
    data: {
      title: input.title as string | undefined,
      description: input.description as string | undefined,
      startDate: input.startDate ? new Date(input.startDate as string) : undefined,
      endDate: input.endDate ? new Date(input.endDate as string) : undefined,
      budgetTotal: input.budgetTotal as number | undefined,
      visibility: input.visibility as never,
      status: input.status as never
    },
    include: tripInclude
  });
}

export async function deleteTrip(userId: string, tripId: string) {
  await getTrip(userId, tripId);
  return prisma.trip.delete({ where: { id: tripId }, select: { id: true } });
}

export async function shareTrip(userId: string, tripId: string) {
  const trip = await getTrip(userId, tripId);
  const base = slugify(trip.title, { lower: true, strict: true });
  return prisma.trip.update({
    where: { id: tripId },
    data: { visibility: "PUBLIC", shareSlug: trip.shareSlug ?? `${base}-${randomSlug()}` },
    include: tripInclude
  });
}

export async function uploadCover(userId: string, tripId: string, file: Express.Multer.File) {
  await getTrip(userId, tripId);
  const coverUrl = await uploadBuffer(file.buffer, "traveloop/covers");
  return prisma.trip.update({ where: { id: tripId }, data: { coverUrl }, include: tripInclude });
}
