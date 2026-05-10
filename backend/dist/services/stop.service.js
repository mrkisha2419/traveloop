import { prisma } from "../utils/prisma.js";
import { getTrip } from "./trip.service.js";
export async function addStop(userId, tripId, input) {
    await getTrip(userId, tripId);
    const order = await prisma.stop.count({ where: { tripId } });
    return prisma.stop.create({
        data: {
            tripId,
            cityId: input.cityId,
            title: input.title,
            startDate: new Date(input.startDate),
            endDate: new Date(input.endDate),
            order
        },
        include: { city: true, activities: true }
    });
}
export async function updateStop(userId, tripId, stopId, input) {
    await getTrip(userId, tripId);
    return prisma.stop.update({
        where: { id: stopId },
        data: {
            cityId: input.cityId,
            title: input.title,
            startDate: input.startDate ? new Date(input.startDate) : undefined,
            endDate: input.endDate ? new Date(input.endDate) : undefined,
            notes: input.notes
        },
        include: { city: true, activities: { orderBy: { order: "asc" } } }
    });
}
export async function deleteStop(userId, tripId, stopId) {
    await getTrip(userId, tripId);
    await prisma.stop.delete({ where: { id: stopId } });
    const stops = await prisma.stop.findMany({ where: { tripId }, orderBy: { order: "asc" } });
    await prisma.$transaction(stops.map((stop, order) => prisma.stop.update({ where: { id: stop.id }, data: { order } })));
    return { id: stopId };
}
export async function reorderStops(userId, tripId, stopIds) {
    await getTrip(userId, tripId);
    await prisma.$transaction(stopIds.map((id, index) => prisma.stop.update({ where: { id }, data: { order: -1000 - index } })));
    await prisma.$transaction(stopIds.map((id, index) => prisma.stop.update({ where: { id }, data: { order: index } })));
    return prisma.stop.findMany({ where: { tripId }, orderBy: { order: "asc" }, include: { city: true } });
}
