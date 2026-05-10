import { Compass } from "lucide-react";
import { Button } from "./Button";

export function EmptyState({ title, body, action, onAction }: { title: string; body: string; action?: string; onAction?: () => void }) {
  return (
    <div className="grid min-h-64 place-items-center rounded-xl border border-dashed border-slate-300 bg-white/70 p-8 text-center">
      <div>
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-amber-100 text-amber-600">
          <Compass />
        </div>
        <h3 className="text-lg font-bold text-slate-900">{title}</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{body}</p>
        {action ? <Button className="mt-5" onClick={onAction}>{action}</Button> : null}
      </div>
    </div>
  );
}
