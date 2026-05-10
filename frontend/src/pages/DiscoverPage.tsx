import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MapPin, Plus, Search, Sparkles } from "lucide-react";
import { api } from "@/api/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useDebounce } from "@/hooks/useDebounce";
import { useTripStore } from "@/stores/tripStore";
import type { Activity } from "@/types";

export function DiscoverPage() {
  const [query, setQuery] = useState("");
  const [activities, setActivities] = useState<Activity[]>([]);
  const debounced = useDebounce(query);
  const { cities, searchCities, activeTrip, trips, fetchTrips, addStop, addActivity } = useTripStore();

  useEffect(() => { void fetchTrips(); }, [fetchTrips]);
  useEffect(() => { void searchCities(debounced); void api.get<Activity[]>("/search/activities", { params: { q: debounced } }).then((response) => setActivities(response.data)); }, [debounced, searchCities]);
  const trip = activeTrip ?? trips[0];

  return (
    <div className="page-container pb-24">
      <div className="mb-8"><p className="font-semibold text-amber-600">Discovery</p><h1 className="text-4xl font-black">Discover cities and activities</h1><p className="mt-2 text-slate-500">Search destinations, filter ideas, and add them to your active trip.</p></div>
      <Card className="mb-6"><div className="relative"><Search className="absolute left-3 top-3 text-slate-400" /><Input className="pl-10" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search Lisbon food, Kyoto culture, Bali adventure..." /></div></Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><h2 className="mb-4 text-xl font-black">City cards</h2><div className="grid gap-4">{cities.slice(0, 8).map((city) => <article key={city.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex gap-3"><div className="grid h-12 w-12 place-items-center rounded-xl bg-sky-100 text-sky-600"><MapPin /></div><div className="flex-1"><h3 className="font-black">{city.name}, {city.country}</h3><p className="text-sm text-slate-500">{city.description}</p><div className="mt-2 text-xs font-bold text-slate-500">Cost {city.costIndex} - Popularity {city.popularity}</div></div></div><Button className="mt-4" variant="ghost" onClick={() => trip && void addStop(trip.id, { cityId: city.id, title: city.name, startDate: trip.startDate, endDate: trip.startDate }).then(() => toast.success("City added"))}><Plus size={16} /> Add to trip</Button></article>)}</div></Card>
        <Card><h2 className="mb-4 text-xl font-black">Activity cards</h2><div className="grid gap-4">{activities.slice(0, 8).map((activity) => <article key={activity.id} className="rounded-xl border border-slate-200 p-4"><div className="text-xs font-black uppercase text-amber-600">{activity.category}</div><h3 className="mt-1 font-black">{activity.title}</h3><p className="mt-2 text-sm text-slate-500">{activity.description}</p><Button className="mt-4" variant="ghost" onClick={() => trip?.stops[0] && void addActivity(trip.id, trip.stops[0].id, { activityId: activity.id, title: activity.title, description: activity.description, durationMins: activity.durationMins, cost: activity.estimatedCost }).then(() => toast.success("Activity added"))}><Sparkles size={16} /> Add activity</Button></article>)}</div></Card>
      </div>
    </div>
  );
}
