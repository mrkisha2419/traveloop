import { useEffect, useState } from "react";
import { MapPin, Plus } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useDebounce } from "@/hooks/useDebounce";
import { useTripStore } from "@/stores/tripStore";

export function CitySearchModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (cityId: string, title: string) => void }) {
  const [query, setQuery] = useState("");
  const debounced = useDebounce(query);
  const { cities, searchCities } = useTripStore();

  useEffect(() => {
    if (open) void searchCities(debounced);
  }, [debounced, open, searchCities]);

  return (
    <Modal title="City search" open={open} onClose={onClose}>
      <Input aria-label="Search cities" placeholder="Search by city, region, country" value={query} onChange={(event) => setQuery(event.target.value)} />
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {cities.map((city) => (
          <article key={city.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-sky-100 text-sky-600"><MapPin /></div>
              <div className="min-w-0 flex-1">
                <h3 className="font-bold">{city.name}, {city.country}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-slate-500">{city.description}</p>
                <div className="mt-3 flex gap-2 text-xs">
                  <span className="rounded-full bg-white px-2 py-1">Popularity {city.popularity}</span>
                  <span className="rounded-full bg-white px-2 py-1">Cost {city.costIndex}</span>
                </div>
              </div>
            </div>
            <Button className="mt-4 w-full" onClick={() => onAdd(city.id, city.name)}><Plus size={16} /> Add to trip</Button>
          </article>
        ))}
      </div>
    </Modal>
  );
}
