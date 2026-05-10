import { prisma } from "../utils/prisma.js";
import { getTrip } from "./trip.service.js";

export async function addStopActivity(userId: string, tripId: string, stopId: string, input: {
  activityId?: string;
  title: string;
  description?: string;
  startTime?: string;
  durationMins?: number;
  cost?: number;
}) {
  await getTrip(userId, tripId);
  const order = await prisma.stopActivity.count({ where: { stopId } });
  return prisma.stopActivity.create({
    data: {
      stopId,
      activityId: input.activityId,
      title: input.title,
      description: input.description,
      startTime: input.startTime ? new Date(input.startTime) : undefined,
      durationMins: input.durationMins ?? 60,
      cost: input.cost ?? 0,
      order
    },
    include: { activity: true }
  });
}

export async function updateStopActivity(userId: string, tripId: string, activityId: string, input: Record<string, unknown>) {
  await getTrip(userId, tripId);
  return prisma.stopActivity.update({
    where: { id: activityId },
    data: {
      title: input.title as string | undefined,
      description: input.description as string | undefined,
      startTime: input.startTime ? new Date(input.startTime as string) : undefined,
      durationMins: input.durationMins as number | undefined,
      cost: input.cost as number | undefined,
      order: input.order as number | undefined
    }
  });
}

export async function removeStopActivity(userId: string, tripId: string, activityId: string) {
  await getTrip(userId, tripId);
  return prisma.stopActivity.delete({ where: { id: activityId }, select: { id: true } });
}
