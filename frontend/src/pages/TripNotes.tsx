import { useEffect, useState } from "react";
import type * as React from "react";
import toast from "react-hot-toast";
import { formatDistanceToNow } from "date-fns";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { useTripStore } from "@/stores/tripStore";
import type { Note } from "@/types";

export function TripNotes() {
  const [selected, setSelected] = useState<Note | null>(null);
  const [draft, setDraft] = useState({ title: "", body: "", stopId: "" });
  const { trips, activeTrip, fetchTrips, fetchTrip, addNote, updateNote } = useTripStore();
  useEffect(() => { void fetchTrips(); }, [fetchTrips]);
  useEffect(() => { if (!activeTrip && trips[0]) void fetchTrip(trips[0].id); }, [activeTrip, fetchTrip, trips]);
  const trip = activeTrip ?? trips[0];

  useEffect(() => {
    if (selected) setDraft({ title: selected.title, body: selected.body, stopId: selected.stopId ?? "" });
  }, [selected]);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    if (!trip) return;
    if (selected) await updateNote(trip.id, selected.id, draft);
    else await addNote(trip.id, draft);
    toast.success("Note saved");
    setSelected(null);
    setDraft({ title: "", body: "", stopId: "" });
  }

  return (
    <div className="page-container pb-24">
      <div className="mb-8"><p className="font-semibold text-amber-600">Trip notes</p><h1 className="text-4xl font-black">{trip?.title ?? "Trip"} journal</h1><p className="mt-2 text-slate-500">Notes sidebar, stop linking, timestamps, and autosave-ready editor.</p></div>
      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card>
          <Button className="mb-4 w-full" onClick={() => { setSelected(null); setDraft({ title: "", body: "", stopId: "" }); }}>New note</Button>
          <div className="grid gap-3">{trip?.notes?.map((note) => <button key={note.id} className={`rounded-xl p-3 text-left ${selected?.id === note.id ? "bg-amber-100" : "bg-slate-50"}`} onClick={() => setSelected(note)}><div className="font-bold">{note.title}</div><div className="text-xs text-slate-500">{formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}</div></button>)}</div>
        </Card>
        <Card>
          <form className="grid gap-4" onSubmit={(event) => void save(event)}>
            <div><Label>Title</Label><Input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} required /></div>
            <div><Label>Linked stop</Label><select className="min-h-11 w-full rounded-lg border border-slate-200 px-3" value={draft.stopId} onChange={(event) => setDraft({ ...draft, stopId: event.target.value })}><option value="">No stop</option>{trip?.stops.map((stop) => <option value={stop.id} key={stop.id}>{stop.title}</option>)}</select></div>
            <div><Label>Note</Label><Textarea className="min-h-[320px]" value={draft.body} onChange={(event) => setDraft({ ...draft, body: event.target.value })} required /></div>
            <Button type="submit"><Save size={16} /> Save note</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
