import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Input";

export function AiPromptModal({ open, onClose, onGenerate, loading }: { open: boolean; onClose: () => void; onGenerate: (prompt: string) => Promise<void>; loading?: boolean }) {
  const [prompt, setPrompt] = useState("Create a balanced route with food markets, culture, low-crowd mornings, and one flexible rest block each day.");
  return (
    <Modal title="Generate itinerary with AI" open={open} onClose={onClose}>
      <p className="mb-3 text-sm text-slate-500">Claude will return structured stops, activities, durations, and estimated costs, then Traveloop will create the itinerary automatically.</p>
      <Textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} />
      <div className="mt-4 flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button disabled={loading} onClick={() => void onGenerate(prompt)}><Sparkles size={16} /> {loading ? "Generating..." : "Generate with AI"}</Button>
      </div>
    </Modal>
  );
}
