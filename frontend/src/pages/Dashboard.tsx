import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Calendar, Compass, Plus, Search, TrendingUp, WalletCards } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { currency } from "@/lib/utils";
import { useAuthStore } from "@/stores/authStore";
import { useTripStore } from "@/stores/tripStore";

export function Dashboard() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const { trips, loading, fetchTrips, searchCities, cities } = useTripStore();

  useEffect(() => {
    void fetchTrips();
    void searchCities();
  }, [fetchTrips, searchCities]);

  const upcoming = trips.slice(0, 4);
  const totalBudget = trips.reduce((sum, trip) => sum + Number(trip.budgetTotal), 0);
  const kpis = [
    { label: "Trips", value: trips.length, icon: Compass },
    { label: "Budget planned", value: currency(totalBudget), icon: WalletCards },
    { label: "Shared", value: trips.filter((trip) => trip.visibility === "PUBLIC").length, icon: TrendingUp },
    { label: "Upcoming", value: upcoming.length, icon: Calendar }
  ];

  return (
    <div className="page-container pb-24">
      <header className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-semibold text-amber-600">{format(new Date(), "EEEE, MMMM d")}</p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-slate-950">Good to see you, {user?.name?.split(" ")[0] ?? "traveler"}</h1>
          <p className="mt-2 text-slate-500">Design beautiful routes, budgets, packing lists, notes, and public trip pages.</p>
        </div>
        <div className="flex gap-3"><Button variant="ghost" aria-label="Notifications"><Bell size={18} /></Button><Button onClick={() => navigate("/create-trip")}><Plus size={18} /> Plan new trip</Button></div>
      </header>

      <section className="travel-gradient relative overflow-hidden rounded-[2rem] p-6 shadow-travel lg:p-10">
        <div className="max-w-2xl">
          <div className="mb-4 inline-flex rounded-full bg-white/70 px-4 py-2 text-sm font-bold text-slate-700 shadow-sm">Premium travel-tech workspace</div>
          <h2 className="text-4xl font-black leading-tight text-slate-950 lg:text-6xl">Where should your next loop begin?</h2>
          <div className="mt-6 flex max-w-2xl flex-col gap-3 rounded-2xl bg-white p-3 shadow-md sm:flex-row">
            <div className="flex flex-1 items-center gap-3 px-3"><Search className="text-slate-400" /><input className="w-full outline-none" placeholder="Search cities, food routes, museums..." /></div>
            <Button onClick={() => navigate("/itinerary")}>Start planning</Button>
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-5 lg:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon }) => (
          <Card key={label}><div className="flex items-center justify-between"><div><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div><div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-600"><Icon /></div></div></Card>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <CardHeader><CardTitle>Upcoming trips</CardTitle><Button variant="ghost" onClick={() => navigate("/trips")}>View all</Button></CardHeader>
          {loading ? <div className="grid gap-4 sm:grid-cols-2">{[1, 2].map((x) => <Skeleton key={x} className="h-44" />)}</div> : upcoming.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {upcoming.map((trip) => (
                <button key={trip.id} onClick={() => navigate(`/itinerary?trip=${trip.id}`)} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                  <div className="h-32 bg-gradient-to-br from-sky-200 via-amber-100 to-emerald-100" />
                  <div className="p-4"><h3 className="font-bold text-slate-950">{trip.title}</h3><p className="mt-1 text-sm text-slate-500">{format(new Date(trip.startDate), "MMM d")} - {format(new Date(trip.endDate), "MMM d")}</p><p className="mt-3 font-bold text-amber-600">{currency(trip.budgetTotal)}</p></div>
                </button>
              ))}
            </div>
          ) : <EmptyState title="No trips yet" body="Create your first trip and Traveloop will organize every section." action="Create trip" onAction={() => navigate("/create-trip")} />}
        </Card>
        <Card>
          <CardHeader><CardTitle>Recommended destinations</CardTitle><span className="text-sm text-slate-500">Seeded cities</span></CardHeader>
          <div className="grid gap-3">
            {cities.slice(0, 5).map((city) => (
              <div key={city.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-sky-100 text-sky-600"><Compass size={18} /></div>
                <div className="min-w-0 flex-1"><div className="font-bold">{city.name}</div><div className="text-sm text-slate-500">{city.country} - popularity {city.popularity}</div></div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
