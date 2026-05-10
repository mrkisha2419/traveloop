import { prisma } from "../utils/prisma.js";
import { getTrip } from "./trip.service.js";
export async function listChecklist(userId, tripId) {
    await getTrip(userId, tripId);
    return prisma.checklistItem.findMany({ where: { tripId }, orderBy: [{ category: "asc" }, { order: "asc" }] });
}
export async function addChecklistItem(userId, tripId, input) {
    await getTrip(userId, tripId);
    const order = await prisma.checklistItem.count({ where: { tripId, category: input.category } });
    return prisma.checklistItem.create({ data: { tripId, category: input.category, label: input.label, order } });
}
export async function updateChecklistItem(userId, tripId, itemId, input) {
    await getTrip(userId, tripId);
    return prisma.checklistItem.update({ where: { id: itemId }, data: input });
}
export async function deleteChecklistItem(userId, tripId, itemId) {
    await getTrip(userId, tripId);
    return prisma.checklistItem.delete({ where: { id: itemId }, select: { id: true } });
}
export async function resetChecklist(userId, tripId) {
    await getTrip(userId, tripId);
    await prisma.checklistItem.updateMany({ where: { tripId }, data: { packed: false } });
    return listChecklist(userId, tripId);
}
