import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, Plus, Search } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { currency } from "@/lib/utils";
import { useTripStore } from "@/stores/tripStore";
import type { TripStatus } from "@/types";

const statuses: Array<TripStatus | "ALL"> = ["ALL", "PLANNING", "UPCOMING", "ONGOING", "COMPLETED"];

export function MyTrips() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TripStatus | "ALL">("ALL");
  const [sort, setSort] = useState<"date" | "budget">("date");
  const { trips, loading, fetchTrips } = useTripStore();
  const navigate = useNavigate();

  useEffect(() => {
    void fetchTrips();
  }, [fetchTrips]);

  const filtered = useMemo(() => trips
    .filter((trip) => status === "ALL" || trip.status === status)
    .filter((trip) => `${trip.title} ${trip.description ?? ""}`.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sort === "budget" ? Number(b.budgetTotal) - Number(a.budgetTotal) : new Date(a.startDate).getTime() - new Date(b.startDate).getTime()), [search, sort, status, trips]);

  return (
    <div className="page-container pb-28">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-semibold text-amber-600">Trip library</p>
          <h1 className="text-4xl font-black">My Trips</h1>
          <p className="mt-2 text-slate-500">Search, filter, sort, open, and share all trip workspaces.</p>
        </div>
        <Button onClick={() => navigate("/create-trip")}><Plus size={18} /> New trip</Button>
      </div>
      <Card className="mb-6">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <div className="relative"><Search className="absolute left-3 top-3 text-slate-400" size={18} /><Input className="pl-10" placeholder="Search trips" value={search} onChange={(event) => setSearch(event.target.value)} /></div>
          <div className="flex flex-wrap gap-2">
            {statuses.map((item) => <button key={item} className={`rounded-full px-3 py-2 text-sm font-bold ${status === item ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-600"}`} onClick={() => setStatus(item)}>{item}</button>)}
          </div>
          <Button variant="ghost" onClick={() => setSort(sort === "date" ? "budget" : "date")}><Filter size={16} /> Sort: {sort}</Button>
        </div>
      </Card>
      {loading ? <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">{[1, 2, 3].map((x) => <Skeleton key={x} className="h-80" />)}</div> : filtered.length ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((trip) => (
            <article key={trip.id} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
              <div className="h-40 bg-gradient-to-br from-sky-200 via-amber-100 to-emerald-100" />
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-black">{trip.title}</h2>
                  {trip.visibility === "PUBLIC" ? <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">Public</span> : null}
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-slate-500">{trip.description}</p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-500">
                  <span>{format(new Date(trip.startDate), "MMM d")} - {format(new Date(trip.endDate), "MMM d")}</span>
                  <span>{currency(trip.budgetTotal)}</span>
                  <span>{trip.stops?.length ?? 0} stops</span>
                  <span>{trip.status}</span>
                </div>
                <Button className="mt-5 w-full" onClick={() => navigate(`/itinerary?trip=${trip.id}`)}>Open trip</Button>
              </div>
            </article>
          ))}
        </div>
      ) : <EmptyState title="No trips found" body="Adjust your filters or create a new trip workspace." action="Create trip" onAction={() => navigate("/create-trip")} />}
      <button className="fixed bottom-20 right-5 grid h-14 w-14 place-items-center rounded-full bg-amber-500 text-white shadow-lg lg:hidden" onClick={() => navigate("/create-trip")} aria-label="Create trip"><Plus /></button>
    </div>
  );
}
