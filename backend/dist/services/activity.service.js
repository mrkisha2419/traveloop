import { prisma } from "../utils/prisma.js";
import { getTrip } from "./trip.service.js";
export async function addStopActivity(userId, tripId, stopId, input) {
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
export async function updateStopActivity(userId, tripId, activityId, input) {
    await getTrip(userId, tripId);
    return prisma.stopActivity.update({
        where: { id: activityId },
        data: {
            title: input.title,
            description: input.description,
            startTime: input.startTime ? new Date(input.startTime) : undefined,
            durationMins: input.durationMins,
            cost: input.cost,
            order: input.order
        }
    });
}
export async function removeStopActivity(userId, tripId, activityId) {
    await getTrip(userId, tripId);
    return prisma.stopActivity.delete({ where: { id: activityId }, select: { id: true } });
}
