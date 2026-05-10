import { prisma } from "../utils/prisma.js";
import { getTrip } from "./trip.service.js";
export async function listExpenses(userId, tripId) {
    await getTrip(userId, tripId);
    return prisma.expense.findMany({ where: { tripId }, orderBy: { spentAt: "desc" } });
}
export async function createExpense(userId, tripId, input) {
    await getTrip(userId, tripId);
    return prisma.expense.create({
        data: {
            userId,
            tripId,
            title: input.title,
            category: input.category,
            amount: input.amount,
            spentAt: new Date(input.spentAt),
            notes: input.notes
        }
    });
}
export async function updateExpense(userId, tripId, expenseId, input) {
    await getTrip(userId, tripId);
    return prisma.expense.update({
        where: { id: expenseId },
        data: {
            title: input.title,
            category: input.category,
            amount: input.amount,
            spentAt: input.spentAt ? new Date(input.spentAt) : undefined,
            notes: input.notes
        }
    });
}
export async function deleteExpense(userId, tripId, expenseId) {
    await getTrip(userId, tripId);
    return prisma.expense.delete({ where: { id: expenseId }, select: { id: true } });
}
