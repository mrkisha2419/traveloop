import { differenceInCalendarDays } from "date-fns";
import { prisma } from "../utils/prisma.js";
import { getTrip } from "./trip.service.js";

export async function getBudgetBreakdown(userId: string, tripId: string) {
  const trip = await getTrip(userId, tripId);
  const spentByCategory = await prisma.expense.groupBy({
    by: ["category"],
    where: { tripId },
    _sum: { amount: true }
  });
  const spentTotal = spentByCategory.reduce((sum, item) => sum + Number(item._sum.amount ?? 0), 0);
  const days = Math.max(1, differenceInCalendarDays(trip.endDate, trip.startDate) + 1);
  return {
    tripBudget: Number(trip.budgetTotal),
    spentTotal,
    remaining: Number(trip.budgetTotal) - spentTotal,
    overBudget: spentTotal > Number(trip.budgetTotal),
    perDayBudget: Number(trip.budgetTotal) / days,
    perDaySpent: spentTotal / days,
    budgets: trip.budgets.map((budget) => {
      const spent = spentByCategory.find((item) => item.category === budget.category);
      return {
        category: budget.category,
        planned: Number(budget.planned),
        spent: Number(spent?._sum.amount ?? 0)
      };
    }),
    stopBreakdown: trip.stops.map((stop) => ({
      stopId: stop.id,
      title: stop.title,
      estimatedActivities: stop.activities.reduce((sum, activity) => sum + Number(activity.cost), 0)
    }))
  };
}
