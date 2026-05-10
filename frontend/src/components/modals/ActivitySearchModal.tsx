import { useEffect, useState } from "react";
import { Plus, SlidersHorizontal } from "lucide-react";
import { api } from "@/api/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { useDebounce } from "@/hooks/useDebounce";
import { currency } from "@/lib/utils";
import type { Activity, ActivityCategory } from "@/types";

const categories: Array<ActivityCategory | "ALL"> = ["ALL", "SIGHTSEEING", "FOOD", "ADVENTURE", "SHOPPING", "CULTURE"];

export function ActivitySearchModal({ open, onClose, cityId, onAdd }: { open: boolean; onClose: () => void; cityId?: string; onAdd: (activity: Activity) => void }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<ActivityCategory | "ALL">("ALL");
  const [maxCost, setMaxCost] = useState(120);
  const [activities, setActivities] = useState<Activity[]>([]);
  const debounced = useDebounce(query);

  useEffect(() => {
    if (!open) return;
    void api.get<Activity[]>("/search/activities", { params: { q: debounced, cityId, category: category === "ALL" ? undefined : category, maxCost } }).then(({ data }) => setActivities(data));
  }, [category, cityId, debounced, maxCost, open]);

  return (
    <Modal title="Activity search" open={open} onClose={onClose}>
      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
        <Input aria-label="Search activities" placeholder="Search food, hikes, museums" value={query} onChange={(event) => setQuery(event.target.value)} />
        <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3">
          <SlidersHorizontal size={16} />
          <input aria-label="Max cost" type="range" min={0} max={200} value={maxCost} onChange={(event) => setMaxCost(Number(event.target.value))} />
          <span className="text-sm font-semibold">{currency(maxCost)}</span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((item) => (
          <button key={item} className={`rounded-full px-3 py-1 text-sm font-semibold ${category === item ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-600"}`} onClick={() => setCategory(item)}>
            {item.toLowerCase()}
          </button>
        ))}
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {activities.map((activity) => (
          <article key={activity.id} className="rounded-xl border border-slate-200 p-4">
            <div className="text-xs font-bold uppercase text-sky-600">{activity.category}</div>
            <h3 className="mt-1 font-bold">{activity.title}</h3>
            <p className="mt-2 text-sm text-slate-500">{activity.description}</p>
            <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
              <span>{activity.durationMins} min</span>
              <span>{currency(activity.estimatedCost)}</span>
            </div>
            <Button className="mt-4 w-full" onClick={() => onAdd(activity)}><Plus size={16} /> Add activity</Button>
          </article>
        ))}
      </div>
    </Modal>
  );
}
