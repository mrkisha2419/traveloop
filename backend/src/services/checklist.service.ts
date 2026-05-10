import { prisma } from "../utils/prisma.js";
import { getTrip } from "./trip.service.js";

export async function listChecklist(userId: string, tripId: string) {
  await getTrip(userId, tripId);
  return prisma.checklistItem.findMany({ where: { tripId }, orderBy: [{ category: "asc" }, { order: "asc" }] });
}

export async function addChecklistItem(userId: string, tripId: string, input: { category: string; label: string }) {
  await getTrip(userId, tripId);
  const order = await prisma.checklistItem.count({ where: { tripId, category: input.category } });
  return prisma.checklistItem.create({ data: { tripId, category: input.category, label: input.label, order } });
}

export async function updateChecklistItem(userId: string, tripId: string, itemId: string, input: { label?: string; packed?: boolean; category?: string }) {
  await getTrip(userId, tripId);
  return prisma.checklistItem.update({ where: { id: itemId }, data: input });
}

export async function deleteChecklistItem(userId: string, tripId: string, itemId: string) {
  await getTrip(userId, tripId);
  return prisma.checklistItem.delete({ where: { id: itemId }, select: { id: true } });
}

export async function resetChecklist(userId: string, tripId: string) {
  await getTrip(userId, tripId);
  await prisma.checklistItem.updateMany({ where: { tripId }, data: { packed: false } });
  return listChecklist(userId, tripId);
}
