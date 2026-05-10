import { ActivityCategory } from "@prisma/client";
import { prisma } from "../utils/prisma.js";

export function searchCities(query = "", filters: { region?: string; maxCost?: number } = {}) {
  return prisma.city.findMany({
    where: {
      region: filters.region,
      costIndex: filters.maxCost ? { lte: filters.maxCost } : undefined,
      OR: query ? [
        { name: { contains: query, mode: "insensitive" } },
        { country: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } }
      ] : undefined
    },
    orderBy: [{ popularity: "desc" }, { costIndex: "asc" }],
    take: 40,
    include: { activities: { take: 5 } }
  });
}

export function searchActivities(query = "", filters: { cityId?: string; category?: ActivityCategory; maxCost?: number; maxDuration?: number } = {}) {
  return prisma.activity.findMany({
    where: {
      cityId: filters.cityId,
      category: filters.category,
      estimatedCost: filters.maxCost ? { lte: filters.maxCost } : undefined,
      durationMins: filters.maxDuration ? { lte: filters.maxDuration } : undefined,
      OR: query ? [
        { title: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } }
      ] : undefined
    },
    include: { city: true },
    orderBy: [{ estimatedCost: "asc" }, { durationMins: "asc" }],
    take: 60
  });
}
