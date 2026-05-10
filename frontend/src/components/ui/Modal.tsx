import type * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

export function Modal({ title, open, onClose, children, className }: { title: string; open: boolean; onClose: () => void; children: React.ReactNode; className?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label={title}>
      <div className={cn("max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-white p-6 shadow-2xl", className)}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold text-slate-900">{title}</h2>
          <Button variant="ghost" className="h-10 w-10 p-0" onClick={onClose} aria-label="Close modal"><X size={18} /></Button>
        </div>
        {children}
      </div>
    </div>
  );
}
