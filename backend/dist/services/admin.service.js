import { prisma } from "../utils/prisma.js";
export async function analytics() {
    const [users, trips, publicTrips, expenses] = await Promise.all([
        prisma.user.count(),
        prisma.trip.count(),
        prisma.trip.count({ where: { visibility: "PUBLIC" } }),
        prisma.expense.aggregate({ _sum: { amount: true } })
    ]);
    const popularDestinations = await prisma.stop.groupBy({
        by: ["cityId"],
        where: { cityId: { not: null } },
        _count: { cityId: true },
        orderBy: { _count: { cityId: "desc" } },
        take: 8
    });
    const cities = await prisma.city.findMany({ where: { id: { in: popularDestinations.map((item) => item.cityId).filter(Boolean) } } });
    return {
        kpis: {
            users,
            trips,
            publicTrips,
            totalExpenses: Number(expenses._sum.amount ?? 0)
        },
        popularDestinations: popularDestinations.map((item) => ({
            city: cities.find((city) => city.id === item.cityId),
            count: item._count.cityId
        }))
    };
}
export function listUsers() {
    return prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        select: { id: true, name: true, email: true, role: true, city: true, country: true, createdAt: true, _count: { select: { trips: true } } }
    });
}
export function tripsAnalytics() {
    return prisma.trip.findMany({
        orderBy: { createdAt: "desc" },
        take: 50,
        include: { user: { select: { id: true, name: true, email: true } }, stops: true, expenses: true }
    });
}
