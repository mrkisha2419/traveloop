import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarDays, Download, ListChecks, Route } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useTripStore } from "@/stores/tripStore";
import { currency } from "@/lib/utils";

export function ItineraryView() {
  const [mode, setMode] = useState<"timeline" | "calendar">("timeline");
  const { trips, activeTrip, fetchTrips, fetchTrip } = useTripStore();
  useEffect(() => { void fetchTrips(); }, [fetchTrips]);
  useEffect(() => { if (!activeTrip && trips[0]) void fetchTrip(trips[0].id); }, [activeTrip, fetchTrip, trips]);
  const trip = activeTrip ?? trips[0];

  if (!trip) return <div className="page-container">No trip selected.</div>;

  return (
    <div className="page-container pb-24">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div><p className="font-semibold text-amber-600">Read-only itinerary</p><h1 className="text-4xl font-black">{trip.title}</h1><p className="mt-2 text-slate-500">{format(new Date(trip.startDate), "MMM d")} - {format(new Date(trip.endDate), "MMM d")}</p></div>
        <div className="flex gap-3"><Button variant="ghost" onClick={() => setMode(mode === "timeline" ? "calendar" : "timeline")}><CalendarDays size={18} /> {mode}</Button><Button variant="secondary" onClick={() => window.print()}><Download size={18} /> PDF export</Button><Link to="/itinerary"><Button>Edit</Button></Link></div>
      </div>
      <Card className="mb-6 travel-gradient">
        <div className="grid gap-4 md:grid-cols-3">
          <div><p className="text-sm font-bold text-slate-500">Stops</p><p className="text-3xl font-black">{trip.stops.length}</p></div>
          <div><p className="text-sm font-bold text-slate-500">Activities</p><p className="text-3xl font-black">{trip.stops.flatMap((stop) => stop.activities).length}</p></div>
          <div><p className="text-sm font-bold text-slate-500">Activity estimate</p><p className="text-3xl font-black">{currency(trip.stops.flatMap((stop) => stop.activities).reduce((sum, activity) => sum + Number(activity.cost), 0))}</p></div>
        </div>
      </Card>
      {mode === "timeline" ? (
        <div className="grid gap-5">
          {trip.stops.map((stop, index) => (
            <Card key={stop.id}>
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sky-100 text-sky-600"><Route /></div>
                <div className="flex-1">
                  <h2 className="text-2xl font-black">{stop.title}</h2>
                  <p className="text-sm text-slate-500">Day {index + 1} - {format(new Date(stop.startDate), "MMM d")} to {format(new Date(stop.endDate), "MMM d")}</p>
                  <div className="mt-5 grid gap-3">
                    {stop.activities.map((activity) => <div key={activity.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="font-bold">{activity.title}</div><div className="text-sm text-slate-500">{activity.description}</div></div>)}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          {trip.stops.map((stop, index) => <Card key={stop.id}><div className="flex items-center gap-3"><ListChecks className="text-emerald-600" /><div><h3 className="font-black">Day {index + 1}</h3><p className="text-sm text-slate-500">{stop.title}</p></div></div><div className="mt-4 grid gap-2">{stop.activities.map((activity) => <span className="rounded-lg bg-slate-50 px-3 py-2 text-sm" key={activity.id}>{activity.title}</span>)}</div></Card>)}
        </div>
      )}
    </div>
  );
}
