import { useMemo, useState } from "react";
import type * as React from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { differenceInCalendarDays, format } from "date-fns";
import { CalendarDays, CheckCircle2, Eye, ImagePlus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardTitle } from "@/components/ui/Card";
import { Input, Label, Textarea } from "@/components/ui/Input";
import { useTripStore } from "@/stores/tripStore";

export function CreateTrip() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    budgetTotal: "2400",
    currency: "USD",
    visibility: "PRIVATE"
  });
  const createTrip = useTripStore((state) => state.createTrip);
  const navigate = useNavigate();
  const duration = useMemo(() => form.startDate && form.endDate ? Math.max(1, differenceInCalendarDays(new Date(form.endDate), new Date(form.startDate)) + 1) : 0, [form.endDate, form.startDate]);
  const steps = [
    { label: "Basics", icon: MapPin },
    { label: "Dates", icon: CalendarDays },
    { label: "Visibility", icon: Eye }
  ];

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!form.title || !form.startDate || !form.endDate) {
      toast.error("Complete title and dates");
      return;
    }
    const trip = await createTrip({ ...form, budgetTotal: Number(form.budgetTotal) });
    toast.success("Trip created");
    navigate(`/itinerary?trip=${trip.id}`);
  }

  return (
    <div className="page-container pb-24">
      <div className="mb-8">
        <p className="font-semibold text-amber-600">3-step trip setup</p>
        <h1 className="mt-2 text-4xl font-black text-slate-950">Create a new trip</h1>
        <p className="mt-2 text-slate-500">Add the basics, dates, budget, visibility, and cover style.</p>
      </div>
      <form onSubmit={(event) => void submit(event)} className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="min-h-[560px]">
          <div className="mb-8 grid grid-cols-3 gap-3">
            {steps.map(({ label, icon: Icon }, index) => (
              <button key={label} type="button" className={`rounded-xl border p-4 text-left transition ${step === index + 1 ? "border-amber-300 bg-amber-50 text-amber-800" : "border-slate-200 bg-white"}`} onClick={() => setStep(index + 1)}>
                <Icon className="mb-2" size={20} />
                <span className="font-bold">{label}</span>
              </button>
            ))}
          </div>
          {step === 1 ? (
            <div className="grid gap-5">
              <div><Label>Trip title</Label><Input value={form.title} onChange={(event) => set("title", event.target.value)} placeholder="Portugal design loop" required /></div>
              <div><Label>Description</Label><Textarea value={form.description} onChange={(event) => set("description", event.target.value)} placeholder="Food, rail, culture, boutique stays..." /></div>
              <div className="grid place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
                <ImagePlus className="mb-3 text-sky-500" />
                <p className="font-bold">Cover upload ready</p>
                <p className="text-sm text-slate-500">Use the trip details page API to upload a final cover image.</p>
              </div>
            </div>
          ) : null}
          {step === 2 ? (
            <div className="grid gap-5 sm:grid-cols-2">
              <div><Label>Start date</Label><Input type="date" value={form.startDate} onChange={(event) => set("startDate", event.target.value)} required /></div>
              <div><Label>End date</Label><Input type="date" value={form.endDate} onChange={(event) => set("endDate", event.target.value)} required /></div>
              <div><Label>Budget</Label><Input type="number" value={form.budgetTotal} onChange={(event) => set("budgetTotal", event.target.value)} min={0} /></div>
              <div><Label>Currency</Label><Input value={form.currency} onChange={(event) => set("currency", event.target.value.toUpperCase())} /></div>
              <div className="rounded-2xl bg-sky-50 p-5 sm:col-span-2"><p className="font-bold text-sky-800">Duration</p><p className="mt-1 text-3xl font-black text-sky-950">{duration || "Select dates"} {duration ? "days" : ""}</p></div>
            </div>
          ) : null}
          {step === 3 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {["PRIVATE", "PUBLIC"].map((value) => (
                <button key={value} type="button" className={`rounded-2xl border p-6 text-left transition ${form.visibility === value ? "border-emerald-300 bg-emerald-50" : "border-slate-200"}`} onClick={() => set("visibility", value)}>
                  <CheckCircle2 className={form.visibility === value ? "text-emerald-600" : "text-slate-300"} />
                  <h3 className="mt-4 text-lg font-black">{value === "PRIVATE" ? "Private planning" : "Public share page"}</h3>
                  <p className="mt-2 text-sm text-slate-500">{value === "PRIVATE" ? "Only you can access this workspace." : "Generate a public read-only itinerary link."}</p>
                </button>
              ))}
            </div>
          ) : null}
          <div className="mt-8 flex justify-between">
            <Button type="button" variant="ghost" disabled={step === 1} onClick={() => setStep((value) => value - 1)}>Back</Button>
            {step < 3 ? <Button type="button" onClick={() => setStep((value) => value + 1)}>Continue</Button> : <Button type="submit">Create trip</Button>}
          </div>
        </Card>
        <Card className="h-fit">
          <CardTitle>Live preview</CardTitle>
          <div className="mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-amber-100 via-sky-100 to-emerald-100 p-5">
            <div className="rounded-xl bg-white/80 p-5 shadow-sm">
              <h3 className="text-2xl font-black">{form.title || "Untitled trip"}</h3>
              <p className="mt-2 text-sm text-slate-600">{form.description || "Your trip summary appears here."}</p>
              <div className="mt-4 text-sm font-semibold text-slate-500">{form.startDate ? format(new Date(form.startDate), "MMM d") : "Start"} - {form.endDate ? format(new Date(form.endDate), "MMM d") : "End"}</div>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
