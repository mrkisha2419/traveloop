import { prisma } from "../utils/prisma.js";
import { getTrip } from "./trip.service.js";

export async function listExpenses(userId: string, tripId: string) {
  await getTrip(userId, tripId);
  return prisma.expense.findMany({ where: { tripId }, orderBy: { spentAt: "desc" } });
}

export async function createExpense(userId: string, tripId: string, input: { title: string; category: string; amount: number; spentAt: string; notes?: string }) {
  await getTrip(userId, tripId);
  return prisma.expense.create({
    data: {
      userId,
      tripId,
      title: input.title,
      category: input.category as never,
      amount: input.amount,
      spentAt: new Date(input.spentAt),
      notes: input.notes
    }
  });
}

export async function updateExpense(userId: string, tripId: string, expenseId: string, input: Record<string, unknown>) {
  await getTrip(userId, tripId);
  return prisma.expense.update({
    where: { id: expenseId },
    data: {
      title: input.title as string | undefined,
      category: input.category as never,
      amount: input.amount as number | undefined,
      spentAt: input.spentAt ? new Date(input.spentAt as string) : undefined,
      notes: input.notes as string | undefined
    }
  });
}

export async function deleteExpense(userId: string, tripId: string, expenseId: string) {
  await getTrip(userId, tripId);
  return prisma.expense.delete({ where: { id: expenseId }, select: { id: true } });
}
