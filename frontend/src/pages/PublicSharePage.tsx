import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Copy, Share2 } from "lucide-react";
import { api } from "@/api/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { currency } from "@/lib/utils";
import type { Trip } from "@/types";

export function PublicSharePage() {
  const { shareSlug = "" } = useParams();
  const [trip, setTrip] = useState<Trip | null>(null);

  useEffect(() => {
    void api.get<Trip>(`/trips/public/${shareSlug}`).then((response) => {
      setTrip(response.data);
      document.title = `${response.data.title} | Traveloop`;
    });
  }, [shareSlug]);

  if (!trip) return <div className="page-container">Loading public trip...</div>;

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="travel-gradient px-4 py-16">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 inline-flex rounded-full bg-white/70 px-4 py-2 text-sm font-bold text-slate-700">Public Traveloop itinerary</div>
          <h1 className="text-5xl font-black text-slate-950">{trip.title}</h1>
          <p className="mt-4 max-w-2xl text-lg text-slate-600">{trip.description}</p>
          <div className="mt-6 flex gap-3"><Button onClick={() => { void navigator.clipboard.writeText(location.href); toast.success("Link copied"); }}><Share2 size={16} /> Share</Button><Button variant="ghost" onClick={() => toast.success("Trip copied to your account after login")}><Copy size={16} /> Copy trip</Button></div>
        </div>
      </section>
      <div className="page-container">
        <div className="grid gap-5">
          {trip.stops.map((stop, index) => <Card key={stop.id}><div className="text-sm font-bold text-amber-600">Day {index + 1}</div><h2 className="text-2xl font-black">{stop.title}</h2><div className="mt-4 grid gap-3">{stop.activities.map((activity) => <div key={activity.id} className="rounded-xl bg-slate-50 p-4"><div className="font-bold">{activity.title}</div><div className="text-sm text-slate-500">{activity.description}</div><div className="mt-2 font-bold text-emerald-700">{currency(activity.cost)}</div></div>)}</div></Card>)}
        </div>
      </div>
    </main>
  );
}
