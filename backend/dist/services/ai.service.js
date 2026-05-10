import Anthropic from "@anthropic-ai/sdk";
import { ActivityCategory, BudgetCategory } from "@prisma/client";
import { env } from "../config/env.js";
import { prisma } from "../utils/prisma.js";
import { getTrip } from "./trip.service.js";
const anthropic = env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: env.ANTHROPIC_API_KEY }) : null;
async function askClaude(prompt) {
    if (!anthropic)
        return null;
    const response = await anthropic.messages.create({
        model: env.ANTHROPIC_MODEL,
        max_tokens: 2200,
        temperature: 0.4,
        messages: [{ role: "user", content: prompt }]
    });
    const text = response.content.find((part) => part.type === "text")?.text ?? "";
    const jsonStart = text.indexOf("{");
    const jsonEnd = text.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1)
        return null;
    return JSON.parse(text.slice(jsonStart, jsonEnd + 1));
}
export async function generateItinerary(userId, tripId, input) {
    const trip = await getTrip(userId, tripId);
    const ai = await askClaude(`
Return only JSON for a travel itinerary.
Shape: {"budgetEstimate":number,"stops":[{"title":string,"startOffset":number,"endOffset":number,"activities":[{"title":string,"description":string,"durationMins":number,"cost":number}]}]}
Trip: ${trip.title}
Dates: ${trip.startDate.toISOString()} to ${trip.endDate.toISOString()}
Budget: ${trip.budgetTotal}
User prompt: ${input.prompt}
Interests: ${(input.interests ?? []).join(", ")}
`);
    const fallback = {
        budgetEstimate: Number(trip.budgetTotal) * 0.82,
        stops: [
            {
                title: "Arrival neighborhood",
                startOffset: 0,
                endOffset: 1,
                activities: [
                    { title: "Slow orientation walk", description: "Low-pressure route for first-day bearings.", durationMins: 120, cost: 0 },
                    { title: "Local dinner reservation", description: "A flexible dinner block near the stay.", durationMins: 90, cost: 48 }
                ]
            },
            {
                title: "Culture and food district",
                startOffset: 2,
                endOffset: 3,
                activities: [
                    { title: "Museum and design route", description: "Indoor culture block with nearby cafes.", durationMins: 180, cost: 36 },
                    { title: "Market tasting crawl", description: "Street food and local staples.", durationMins: 150, cost: 44 }
                ]
            }
        ]
    };
    const plan = (ai ?? fallback);
    const baseDate = new Date(trip.startDate);
    await prisma.$transaction(async (tx) => {
        await tx.stop.deleteMany({ where: { tripId } });
        for (const [order, stop] of plan.stops.entries()) {
            const startDate = new Date(baseDate);
            startDate.setDate(baseDate.getDate() + stop.startOffset);
            const endDate = new Date(baseDate);
            endDate.setDate(baseDate.getDate() + stop.endOffset);
            const created = await tx.stop.create({
                data: { tripId, title: stop.title, order, startDate, endDate }
            });
            await tx.stopActivity.createMany({
                data: stop.activities.map((activity, index) => ({
                    stopId: created.id,
                    title: activity.title,
                    description: activity.description,
                    durationMins: activity.durationMins,
                    cost: activity.cost,
                    order: index
                }))
            });
        }
    });
    return getTrip(userId, tripId);
}
export async function suggestPacking(input) {
    const ai = await askClaude(`
Return only JSON: {"items":[{"category":string,"label":string}]}.
Create practical packing suggestions for ${input.destination ?? "a trip"}, ${input.days ?? 7} days, season ${input.season ?? "mixed"}, activities ${(input.activities ?? []).join(", ")}.
`);
    return ai ?? {
        items: [
            { category: "Clothing", label: "Layerable jacket" },
            { category: "Electronics", label: "Universal adapter" },
            { category: "Documents", label: "Passport and insurance copies" },
            { category: "Essentials", label: "Reusable bottle" }
        ]
    };
}
export async function recommendDestinations(input) {
    const cities = await prisma.city.findMany({
        where: {
            region: input.region,
            costIndex: input.budget && input.budget < 1800 ? { lte: 60 } : undefined
        },
        orderBy: [{ popularity: "desc" }, { costIndex: "asc" }],
        take: 8,
        include: { activities: { where: { category: { in: [ActivityCategory.CULTURE, ActivityCategory.FOOD, ActivityCategory.SIGHTSEEING] } }, take: 3 } }
    });
    const ai = await askClaude(`
Return only JSON: {"recommendations":[{"city":string,"country":string,"reason":string}]}.
Recommend destinations based on interests ${input.interests.join(", ")}, budget ${input.budget ?? "flexible"}, region ${input.region ?? "any"}.
Use these candidate cities: ${cities.map((city) => `${city.name}, ${city.country}`).join("; ")}.
`);
    return { ai: ai ?? null, cities };
}
export function budgetCategories() {
    return Object.values(BudgetCategory);
}
