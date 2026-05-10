import bcrypt from "bcrypt";
import { ActivityCategory, BudgetCategory, PrismaClient, Role, TripStatus, TripVisibility } from "@prisma/client";

const prisma = new PrismaClient();

type CitySeed = {
  name: string;
  country: string;
  region: string;
  costIndex: number;
  popularity: number;
  description: string;
};

const cities: CitySeed[] = [
  { name: "Paris", country: "France", region: "Europe", costIndex: 84, popularity: 98, description: "Iconic museums, neighborhood bakeries, river walks, and elegant architecture." },
  { name: "Tokyo", country: "Japan", region: "Asia", costIndex: 78, popularity: 99, description: "Rail-perfect districts, food alleys, design stores, gardens, and neon nights." },
  { name: "Lisbon", country: "Portugal", region: "Europe", costIndex: 58, popularity: 89, description: "Hillside viewpoints, tiled streets, seafood, trams, and Atlantic light." },
  { name: "Kyoto", country: "Japan", region: "Asia", costIndex: 72, popularity: 94, description: "Temples, tea houses, craft lanes, bamboo paths, and quiet canal routes." },
  { name: "New York", country: "United States", region: "North America", costIndex: 92, popularity: 97, description: "Museums, parks, rooftop views, neighborhoods, and world-class food." },
  { name: "Barcelona", country: "Spain", region: "Europe", costIndex: 66, popularity: 93, description: "Gaudi landmarks, markets, beach walks, tapas, and design-forward hotels." },
  { name: "Seoul", country: "South Korea", region: "Asia", costIndex: 70, popularity: 91, description: "Palaces, cafes, late-night markets, mountain trails, and creative districts." },
  { name: "Bangkok", country: "Thailand", region: "Asia", costIndex: 42, popularity: 95, description: "Temples, river boats, night markets, street food, and rooftop sunsets." },
  { name: "Bali", country: "Indonesia", region: "Asia", costIndex: 48, popularity: 92, description: "Rice terraces, surf beaches, wellness stays, temples, and craft villages." },
  { name: "Rome", country: "Italy", region: "Europe", costIndex: 72, popularity: 96, description: "Ancient ruins, piazzas, trattorias, fountains, and layered history." },
  { name: "Amsterdam", country: "Netherlands", region: "Europe", costIndex: 82, popularity: 90, description: "Canals, museums, bike routes, design shops, and relaxed cafe culture." },
  { name: "London", country: "United Kingdom", region: "Europe", costIndex: 91, popularity: 96, description: "Historic neighborhoods, theatre, markets, parks, and global restaurants." },
  { name: "Dubai", country: "United Arab Emirates", region: "Middle East", costIndex: 86, popularity: 88, description: "Skyline views, desert experiences, luxury shopping, and beach districts." },
  { name: "Singapore", country: "Singapore", region: "Asia", costIndex: 88, popularity: 90, description: "Gardens, hawker centers, polished transit, skyline walks, and museums." },
  { name: "Sydney", country: "Australia", region: "Oceania", costIndex: 83, popularity: 87, description: "Harbor views, coastal walks, surf beaches, markets, and ferry routes." },
  { name: "Cape Town", country: "South Africa", region: "Africa", costIndex: 55, popularity: 86, description: "Mountain panoramas, beaches, food markets, vineyards, and coastal drives." },
  { name: "Marrakech", country: "Morocco", region: "Africa", costIndex: 45, popularity: 84, description: "Medinas, riads, gardens, souks, and warm desert-inspired design." },
  { name: "Reykjavik", country: "Iceland", region: "Europe", costIndex: 94, popularity: 83, description: "Nordic cafes, geothermal pools, dramatic day trips, and ring-road access." },
  { name: "Vancouver", country: "Canada", region: "North America", costIndex: 80, popularity: 84, description: "Seawall cycling, mountain views, diverse food, and urban nature." },
  { name: "Mexico City", country: "Mexico", region: "North America", costIndex: 50, popularity: 89, description: "Museums, markets, design hotels, parks, and one of the world's great food scenes." },
  { name: "Buenos Aires", country: "Argentina", region: "South America", costIndex: 47, popularity: 82, description: "Bookshops, tango, cafes, architecture, parks, and late dinners." },
  { name: "Rio de Janeiro", country: "Brazil", region: "South America", costIndex: 54, popularity: 86, description: "Beaches, viewpoints, music, colorful neighborhoods, and tropical trails." },
  { name: "Prague", country: "Czech Republic", region: "Europe", costIndex: 56, popularity: 85, description: "Castles, bridges, beer halls, old town lanes, and atmospheric walks." },
  { name: "Porto", country: "Portugal", region: "Europe", costIndex: 55, popularity: 83, description: "Riverside lanes, port cellars, tiled stations, bookstores, and relaxed food routes." },
  { name: "Istanbul", country: "Turkey", region: "Europe/Asia", costIndex: 52, popularity: 90, description: "Bazaars, mosques, ferries, layered neighborhoods, and Bosphorus views." },
  { name: "Athens", country: "Greece", region: "Europe", costIndex: 60, popularity: 84, description: "Ancient sites, rooftop dining, island connections, and lively streets." },
  { name: "Hanoi", country: "Vietnam", region: "Asia", costIndex: 34, popularity: 82, description: "Old quarter lanes, lakes, coffee culture, street food, and day-trip gateways." },
  { name: "Auckland", country: "New Zealand", region: "Oceania", costIndex: 78, popularity: 78, description: "Harbors, islands, volcano walks, wine regions, and relaxed urban stays." },
  { name: "Copenhagen", country: "Denmark", region: "Europe", costIndex: 89, popularity: 81, description: "Bike-first streets, bakeries, harbor swims, design shops, and Nordic dining." },
  { name: "Jaipur", country: "India", region: "Asia", costIndex: 38, popularity: 80, description: "Palaces, markets, heritage hotels, crafts, rooftop views, and desert gateways." }
];

const activityTemplates: Record<ActivityCategory, (city: string) => { title: string; description: string; durationMins: number; cost: number }> = {
  SIGHTSEEING: (city) => ({
    title: `${city} landmark walking circuit`,
    description: `A guided route through the essential viewpoints and signature architecture of ${city}.`,
    durationMins: 180,
    cost: 28
  }),
  FOOD: (city) => ({
    title: `${city} market and tasting crawl`,
    description: `Sample local staples, street snacks, and neighborhood favorites with flexible stops.`,
    durationMins: 150,
    cost: 46
  }),
  ADVENTURE: (city) => ({
    title: `${city} outdoor half-day escape`,
    description: `An active route using parks, water, hills, bikes, or scenic trails near the city.`,
    durationMins: 240,
    cost: 64
  }),
  SHOPPING: (city) => ({
    title: `${city} design shops and local makers`,
    description: `Browse boutiques, craft studios, bookshops, and independent labels.`,
    durationMins: 120,
    cost: 25
  }),
  CULTURE: (city) => ({
    title: `${city} museum and culture pass`,
    description: `A curated indoor block for galleries, history, performance, and local context.`,
    durationMins: 160,
    cost: 36
  })
};

function imageUrl(city: CitySeed) {
  const query = encodeURIComponent(`${city.name} ${city.country} travel`);
  return `https://source.unsplash.com/1200x800/?${query}`;
}

async function seedCities() {
  for (const city of cities) {
    const created = await prisma.city.upsert({
      where: { name_country: { name: city.name, country: city.country } },
      update: {
        region: city.region,
        costIndex: city.costIndex,
        popularity: city.popularity,
        imageUrl: imageUrl(city),
        description: city.description
      },
      create: {
        ...city,
        imageUrl: imageUrl(city)
      }
    });

    for (const category of Object.values(ActivityCategory)) {
      const template = activityTemplates[category](city.name);
      const existing = await prisma.activity.findFirst({
        where: { cityId: created.id, category, title: template.title }
      });
      if (!existing) {
        await prisma.activity.create({
          data: {
            cityId: created.id,
            title: template.title,
            category,
            description: template.description,
            durationMins: template.durationMins,
            estimatedCost: template.cost,
            imageUrl: imageUrl(city)
          }
        });
      }
    }
  }
}

async function seedUsersAndTrip() {
  const passwordHash = await bcrypt.hash("traveloop123", 12);
  const adminHash = await bcrypt.hash("admin123", 12);

  const user = await prisma.user.upsert({
    where: { email: "demo@traveloop.app" },
    update: {},
    create: {
      name: "Mira Kapoor",
      email: "demo@traveloop.app",
      passwordHash,
      city: "Bengaluru",
      country: "India",
      preferences: ["rail routes", "food markets", "boutique stays", "low crowd"]
    }
  });

  await prisma.user.upsert({
    where: { email: "admin@traveloop.app" },
    update: { role: Role.ADMIN },
    create: {
      name: "Traveloop Admin",
      email: "admin@traveloop.app",
      passwordHash: adminHash,
      role: Role.ADMIN,
      preferences: []
    }
  });

  const lisbon = await prisma.city.findUniqueOrThrow({ where: { name_country: { name: "Lisbon", country: "Portugal" } }, include: { activities: true } });
  const porto = await prisma.city.findUniqueOrThrow({ where: { name_country: { name: "Porto", country: "Portugal" } }, include: { activities: true } });

  const trip = await prisma.trip.upsert({
    where: { shareSlug: "demo-portugal-loop" },
    update: {},
    create: {
      userId: user.id,
      title: "Portugal design loop",
      description: "A calm food, rail, and culture itinerary designed for a polished Traveloop demo.",
      startDate: new Date("2027-06-02"),
      endDate: new Date("2027-06-10"),
      visibility: TripVisibility.PUBLIC,
      status: TripStatus.UPCOMING,
      budgetTotal: 2400,
      shareSlug: "demo-portugal-loop",
      budgets: {
        create: [
          { category: BudgetCategory.TRANSPORT, planned: 420 },
          { category: BudgetCategory.FOOD, planned: 380 },
          { category: BudgetCategory.LODGING, planned: 980 },
          { category: BudgetCategory.ACTIVITIES, planned: 340 },
          { category: BudgetCategory.MISCELLANEOUS, planned: 280 }
        ]
      }
    }
  });

  if ((await prisma.stop.count({ where: { tripId: trip.id } })) === 0) {
    const stop = await prisma.stop.create({
      data: {
        tripId: trip.id,
        cityId: lisbon.id,
        title: "Lisbon",
        order: 0,
        startDate: new Date("2027-06-02"),
        endDate: new Date("2027-06-05")
      }
    });
    await prisma.stopActivity.createMany({
      data: lisbon.activities.slice(0, 3).map((activity, index) => ({
        stopId: stop.id,
        activityId: activity.id,
        title: activity.title,
        description: activity.description,
        durationMins: activity.durationMins,
        cost: activity.estimatedCost,
        order: index
      }))
    });

    const secondStop = await prisma.stop.create({
      data: {
        tripId: trip.id,
        cityId: porto.id,
        title: "Porto",
        order: 1,
        startDate: new Date("2027-06-06"),
        endDate: new Date("2027-06-08")
      }
    });
    await prisma.stopActivity.createMany({
      data: porto.activities.slice(0, 2).map((activity, index) => ({
        stopId: secondStop.id,
        activityId: activity.id,
        title: activity.title,
        description: activity.description,
        durationMins: activity.durationMins,
        cost: activity.estimatedCost,
        order: index
      }))
    });
  }

  if ((await prisma.checklistItem.count({ where: { tripId: trip.id } })) === 0) {
    await prisma.checklistItem.createMany({
      data: [
        ["Clothing", "Light jacket"],
        ["Clothing", "Walking shoes"],
        ["Electronics", "Universal adapter"],
        ["Electronics", "Power bank"],
        ["Documents", "Passport"],
        ["Documents", "Travel insurance"],
        ["Essentials", "Medication"]
      ].map(([category, label], order) => ({ tripId: trip.id, category, label, order }))
    });
  }

  if ((await prisma.note.count({ where: { tripId: trip.id } })) === 0) {
    await prisma.note.create({
      data: {
        tripId: trip.id,
        userId: user.id,
        title: "Arrival plan",
        body: "Confirm rail pass pickup, save offline maps, and keep the first evening light."
      }
    });
  }
}

async function main() {
  await seedCities();
  await seedUsersAndTrip();
  console.log("Traveloop seed complete: 30 cities, 150 activities, demo users, and a public trip.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
