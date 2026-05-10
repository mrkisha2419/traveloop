import { useEffect, useMemo, useState } from "react";
import type * as React from "react";
import { useSearchParams, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Bot, Clock, GripVertical, MapPin, Plus, Trash2, WalletCards } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { CitySearchModal } from "@/components/modals/CitySearchModal";
import { ActivitySearchModal } from "@/components/modals/ActivitySearchModal";
import { AiPromptModal } from "@/components/modals/AiPromptModal";
import { useTripStore } from "@/stores/tripStore";
import { currency } from "@/lib/utils";
import type { Stop } from "@/types";

export function ItineraryBuilder() {
  const [params] = useSearchParams();
  const [cityOpen, setCityOpen] = useState(false);
  const [activityStop, setActivityStop] = useState<Stop | null>(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const { trips, activeTrip, autosave, fetchTrips, fetchTrip, addStop, addActivity, reorderStops, deleteStop, generateItinerary } = useTripStore();

  useEffect(() => {
    void fetchTrips();
  }, [fetchTrips]);

  useEffect(() => {
    const tripId = params.get("trip") ?? trips[0]?.id;
    if (tripId) void fetchTrip(tripId);
  }, [fetchTrip, params, trips]);

  const stops = activeTrip?.stops ?? [];
  const firstStop = stops[0];

  async function onDragEnd(event: DragEndEvent) {
    if (!activeTrip || !event.over || event.active.id === event.over.id) return;
    const oldIndex = stops.findIndex((stop) => stop.id === event.active.id);
    const newIndex = stops.findIndex((stop) => stop.id === event.over?.id);
    const reordered = arrayMove(stops, oldIndex, newIndex);
    await reorderStops(activeTrip.id, reordered.map((stop) => stop.id));
    toast.success("Stops reordered");
  }

  async function submitStop(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeTrip) return;
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    await addStop(activeTrip.id, { title: data.title, startDate: data.startDate, endDate: data.endDate });
    event.currentTarget.reset();
    toast.success("Stop added");
  }

  async function generate(prompt: string) {
    if (!activeTrip) return;
    setAiLoading(true);
    try {
      await generateItinerary(activeTrip.id, prompt);
      setAiOpen(false);
      toast.success("AI itinerary generated");
    } finally {
      setAiLoading(false);
    }
  }

  const totalActivityCost = useMemo(() => stops.flatMap((stop) => stop.activities).reduce((sum, activity) => sum + Number(activity.cost), 0), [stops]);

  return (
    <div className="page-container pb-28">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-semibold text-amber-600">Autosave: {autosave}</p>
          <h1 className="text-4xl font-black">{activeTrip?.title ?? "Itinerary builder"}</h1>
          <p className="mt-2 text-slate-500">Drag stops, add city sections, search activities, and generate plans with Claude.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="ghost" onClick={() => setCityOpen(true)}><MapPin size={18} /> City search</Button>
          <Button variant="secondary" onClick={() => setAiOpen(true)}><Bot size={18} /> Generate with AI</Button>
          <Link to="/budget"><Button variant="ghost"><WalletCards size={18} /> Budget</Button></Link>
          <Link to="/itinerary-view"><Button>View itinerary</Button></Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="h-fit">
          <CardHeader><CardTitle>Stops</CardTitle><Button variant="ghost" onClick={() => setCityOpen(true)}><Plus size={16} /></Button></CardHeader>
          <DndContext onDragEnd={(event) => void onDragEnd(event)}>
            <SortableContext items={stops.map((stop) => stop.id)} strategy={verticalListSortingStrategy}>
              <div className="grid gap-3">
                {stops.map((stop) => <SortableStop key={stop.id} stop={stop} onDelete={() => activeTrip && void deleteStop(activeTrip.id, stop.id)} />)}
              </div>
            </SortableContext>
          </DndContext>
          <form className="mt-5 grid gap-3" onSubmit={(event) => void submitStop(event)}>
            <Label>Add stop</Label>
            <Input name="title" placeholder="Porto" required />
            <Input name="startDate" type="date" required />
            <Input name="endDate" type="date" required />
            <Button type="submit">Add stop</Button>
          </form>
        </Card>

        <section className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card><p className="text-sm font-semibold text-slate-500">Stops</p><p className="mt-2 text-3xl font-black">{stops.length}</p></Card>
            <Card><p className="text-sm font-semibold text-slate-500">Activities</p><p className="mt-2 text-3xl font-black">{stops.flatMap((stop) => stop.activities).length}</p></Card>
            <Card><p className="text-sm font-semibold text-slate-500">Planned cost</p><p className="mt-2 text-3xl font-black">{currency(totalActivityCost)}</p></Card>
          </div>
          {stops.map((stop, index) => (
            <Card key={stop.id}>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-bold text-sky-600">Day {index + 1}</div>
                  <h2 className="text-2xl font-black">{stop.title}</h2>
                  <p className="text-sm text-slate-500">{format(new Date(stop.startDate), "MMM d")} - {format(new Date(stop.endDate), "MMM d")}</p>
                </div>
                <Button variant="ghost" onClick={() => setActivityStop(stop)}><Plus size={16} /> Add activity</Button>
              </div>
              <div className="relative grid gap-3 pl-6 before:absolute before:bottom-2 before:left-2 before:top-2 before:w-px before:bg-slate-200">
                {stop.activities.map((activity) => (
                  <div key={activity.id} className="relative rounded-xl border border-slate-200 bg-slate-50 p-4 before:absolute before:-left-[23px] before:top-5 before:h-3 before:w-3 before:rounded-full before:bg-amber-500">
                    <div className="flex items-start justify-between gap-3">
                      <div><h3 className="font-bold">{activity.title}</h3><p className="mt-1 text-sm text-slate-500">{activity.description}</p></div>
                      <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-emerald-700">{currency(activity.cost)}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-sm text-slate-500"><Clock size={15} /> {activity.durationMins} min</div>
                  </div>
                ))}
                {!stop.activities.length ? <div className="rounded-xl border border-dashed border-slate-300 p-5 text-sm text-slate-500">No activities yet. Add one from activity search.</div> : null}
              </div>
            </Card>
          ))}
        </section>
      </div>

      <CitySearchModal open={cityOpen} onClose={() => setCityOpen(false)} onAdd={(cityId, title) => {
        if (!activeTrip) return;
        void addStop(activeTrip.id, { cityId, title, startDate: activeTrip.startDate, endDate: activeTrip.startDate }).then(() => {
          setCityOpen(false);
          toast.success(`${title} added`);
        });
      }} />
      <ActivitySearchModal open={Boolean(activityStop)} cityId={activityStop?.cityId ?? firstStop?.cityId ?? undefined} onClose={() => setActivityStop(null)} onAdd={(activity) => {
        if (!activeTrip || !activityStop) return;
        void addActivity(activeTrip.id, activityStop.id, { activityId: activity.id, title: activity.title, description: activity.description, durationMins: activity.durationMins, cost: activity.estimatedCost }).then(() => {
          setActivityStop(null);
          toast.success("Activity added");
        });
      }} />
      <AiPromptModal open={aiOpen} onClose={() => setAiOpen(false)} loading={aiLoading} onGenerate={generate} />
    </div>
  );
}

function SortableStop({ stop, onDelete }: { stop: Stop; onDelete: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: stop.id });
  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <button {...attributes} {...listeners} aria-label={`Drag ${stop.title}`} className="cursor-grab touch-none"><GripVertical className="text-slate-400" /></button>
      <div className="min-w-0 flex-1"><div className="truncate font-bold">{stop.title}</div><div className="text-xs text-slate-500">{format(new Date(stop.startDate), "MMM d")} - {format(new Date(stop.endDate), "MMM d")}</div></div>
      <button onClick={onDelete} aria-label="Delete stop"><Trash2 size={16} className="text-rose-500" /></button>
    </div>
  );
}
