import { prisma } from "../utils/prisma.js";
import { getTrip } from "./trip.service.js";

export async function listNotes(userId: string, tripId: string) {
  await getTrip(userId, tripId);
  return prisma.note.findMany({ where: { tripId }, orderBy: { updatedAt: "desc" }, include: { stop: true } });
}

export async function createNote(userId: string, tripId: string, input: { title: string; body: string; stopId?: string }) {
  await getTrip(userId, tripId);
  return prisma.note.create({ data: { userId, tripId, ...input }, include: { stop: true } });
}

export async function updateNote(userId: string, tripId: string, noteId: string, input: { title?: string; body?: string; stopId?: string | null }) {
  await getTrip(userId, tripId);
  return prisma.note.update({ where: { id: noteId }, data: input, include: { stop: true } });
}

export async function deleteNote(userId: string, tripId: string, noteId: string) {
  await getTrip(userId, tripId);
  return prisma.note.delete({ where: { id: noteId }, select: { id: true } });
}
