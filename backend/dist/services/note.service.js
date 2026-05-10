import { prisma } from "../utils/prisma.js";
import { getTrip } from "./trip.service.js";
export async function listNotes(userId, tripId) {
    await getTrip(userId, tripId);
    return prisma.note.findMany({ where: { tripId }, orderBy: { updatedAt: "desc" }, include: { stop: true } });
}
export async function createNote(userId, tripId, input) {
    await getTrip(userId, tripId);
    return prisma.note.create({ data: { userId, tripId, ...input }, include: { stop: true } });
}
export async function updateNote(userId, tripId, noteId, input) {
    await getTrip(userId, tripId);
    return prisma.note.update({ where: { id: noteId }, data: input, include: { stop: true } });
}
export async function deleteNote(userId, tripId, noteId) {
    await getTrip(userId, tripId);
    return prisma.note.delete({ where: { id: noteId }, select: { id: true } });
}
