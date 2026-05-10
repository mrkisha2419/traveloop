import { useEffect, useState } from "react";
import type * as React from "react";
import toast from "react-hot-toast";
import { ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { currency } from "@/lib/utils";
import { useTripStore } from "@/stores/tripStore";
import type { BudgetCategory } from "@/types";

const categories: BudgetCategory[] = ["TRANSPORT", "FOOD", "LODGING", "ACTIVITIES", "SHOPPING", "MISCELLANEOUS"];

export function ExpenseTracking() {
  const { trips, activeTrip, fetchTrips, fetchTrip, addExpense } = useTripStore();
  const [form, setForm] = useState({ title: "", category: "FOOD" as BudgetCategory, amount: "", spentAt: new Date().toISOString().slice(0, 10), notes: "" });
  useEffect(() => { void fetchTrips(); }, [fetchTrips]);
  useEffect(() => { if (!activeTrip && trips[0]) void fetchTrip(trips[0].id); }, [activeTrip, fetchTrip, trips]);
  const trip = activeTrip ?? trips[0];

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!trip) return;
    await addExpense(trip.id, { ...form, amount: Number(form.amount) });
    toast.success("Expense added");
    setForm({ title: "", category: "FOOD", amount: "", spentAt: new Date().toISOString().slice(0, 10), notes: "" });
  }

  const expenses = trip?.expenses ?? [];
  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  return (
    <div className="page-container pb-24">
      <div className="mb-8"><p className="font-semibold text-amber-600">Expense tracking</p><h1 className="text-4xl font-black">{trip?.title ?? "Trip"} expenses</h1><p className="mt-2 text-slate-500">Professional finance table, category tracking, and total calculations.</p></div>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card>
          <CardHeader><CardTitle>Expense table</CardTitle><div className="text-2xl font-black text-emerald-600">{currency(total)}</div></CardHeader>
          <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="text-slate-500"><th className="py-2">Item</th><th>Category</th><th>Date</th><th>Amount</th></tr></thead><tbody>{expenses.map((expense) => <tr key={expense.id} className="border-t"><td className="py-3 font-bold">{expense.title}</td><td>{expense.category}</td><td>{new Date(expense.spentAt).toLocaleDateString()}</td><td>{currency(expense.amount)}</td></tr>)}</tbody></table></div>
        </Card>
        <Card>
          <CardHeader><CardTitle>Add expense</CardTitle><ReceiptText className="text-amber-500" /></CardHeader>
          <form className="grid gap-4" onSubmit={(event) => void submit(event)}>
            <div><Label>Title</Label><Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} required /></div>
            <div><Label>Category</Label><select className="min-h-11 w-full rounded-lg border border-slate-200 px-3" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as BudgetCategory })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></div>
            <div><Label>Date</Label><Input type="date" value={form.spentAt} onChange={(event) => setForm({ ...form, spentAt: event.target.value })} required /></div>
            <div><Label>Amount</Label><Input type="number" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} required min={0} /></div>
            <Button type="submit">Add expense</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}
