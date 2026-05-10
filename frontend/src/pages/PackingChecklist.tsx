import { useEffect, useMemo, useState } from "react";
import type * as React from "react";
import toast from "react-hot-toast";
import { ChevronDown, PackageCheck, Sparkles } from "lucide-react";
import { api } from "@/api/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { useTripStore } from "@/stores/tripStore";
import type { ChecklistItem } from "@/types";

export function PackingChecklist() {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const { trips, activeTrip, fetchTrips, fetchTrip, updateChecklistItem, addChecklistItem } = useTripStore();
  useEffect(() => { void fetchTrips(); }, [fetchTrips]);
  useEffect(() => { if (!activeTrip && trips[0]) void fetchTrip(trips[0].id); }, [activeTrip, fetchTrip, trips]);
  const trip = activeTrip ?? trips[0];
  const groups = useMemo(() => (trip?.checklist ?? []).reduce<Record<string, ChecklistItem[]>>((acc, item) => {
    acc[item.category] = [...(acc[item.category] ?? []), item];
    return acc;
  }, {}), [trip?.checklist]);
  const items = trip?.checklist ?? [];
  const packed = items.filter((item) => item.packed).length;
  const progress = items.length ? Math.round((packed / items.length) * 100) : 0;

  async function addItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!trip) return;
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());
    await addChecklistItem(trip.id, data);
    event.currentTarget.reset();
  }

  async function aiSuggest() {
    if (!trip) return;
    const { data } = await api.post(`/ai/trips/${trip.id}/packing`, { destination: trip.title, days: trip.stops.length || 7, persist: true });
    await fetchTrip(trip.id);
    toast.success(`${data.items?.length ?? 0} AI suggestions added`);
  }

  return (
    <div className="page-container pb-24">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between"><div><p className="font-semibold text-amber-600">Packing checklist</p><h1 className="text-4xl font-black">{trip?.title ?? "Trip"} packing</h1><p className="mt-2 text-slate-500">Collapsible categories, animated checkboxes, inline additions, and AI suggestions.</p></div><Button variant="secondary" onClick={() => void aiSuggest()}><Sparkles size={18} /> AI suggestions</Button></div>
      <Card className="mb-6"><div className="flex items-center justify-between"><div><p className="font-bold">Packed progress</p><p className="text-sm text-slate-500">{packed}/{items.length} items packed</p></div><div className="text-3xl font-black text-emerald-600">{progress}%</div></div><div className="mt-4 h-3 rounded-full bg-slate-100"><div className="h-3 rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} /></div></Card>
      <div className="grid gap-5 lg:grid-cols-2">
        {Object.entries(groups).map(([category, categoryItems]) => (
          <Card key={category}>
            <button className="mb-4 flex w-full items-center justify-between" onClick={() => setOpen((current) => ({ ...current, [category]: !current[category] }))}><h2 className="text-xl font-black">{category}</h2><ChevronDown className={open[category] ? "rotate-180 transition" : "transition"} /></button>
            <div className={`grid gap-3 ${open[category] === false ? "hidden" : ""}`}>
              {categoryItems?.map((item) => <label key={item.id} className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"><input className="h-5 w-5 accent-emerald-500" type="checkbox" checked={item.packed} onChange={() => trip && void updateChecklistItem(trip.id, item.id, { packed: !item.packed })} /><span className={item.packed ? "font-semibold text-slate-400 line-through" : "font-semibold"}>{item.label}</span></label>)}
            </div>
          </Card>
        ))}
      </div>
      <Card className="mt-6">
        <form className="grid gap-3 sm:grid-cols-[180px_1fr_auto]" onSubmit={(event) => void addItem(event)}>
          <Input name="category" placeholder="Category" required />
          <Input name="label" placeholder="Add item" required />
          <Button type="submit"><PackageCheck size={16} /> Add item</Button>
        </form>
      </Card>
    </div>
  );
}
