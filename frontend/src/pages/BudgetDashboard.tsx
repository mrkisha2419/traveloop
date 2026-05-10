import { useEffect, useMemo } from "react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AlertTriangle, WalletCards } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { currency } from "@/lib/utils";
import { useTripStore } from "@/stores/tripStore";

const colors = ["#F59E0B", "#0EA5E9", "#10B981", "#6366F1", "#F43F5E", "#64748B"];

export function BudgetDashboard() {
  const { trips, activeTrip, fetchTrips, fetchTrip } = useTripStore();
  useEffect(() => { void fetchTrips(); }, [fetchTrips]);
  useEffect(() => { if (!activeTrip && trips[0]) void fetchTrip(trips[0].id); }, [activeTrip, fetchTrip, trips]);
  const trip = activeTrip ?? trips[0];

  const expenses = trip?.expenses ?? [];
  const spent = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);
  const budgetData = useMemo(() => (trip?.budgets ?? []).map((budget) => ({ name: budget.category, planned: Number(budget.planned), spent: expenses.filter((expense) => expense.category === budget.category).reduce((sum, expense) => sum + Number(expense.amount), 0) })), [expenses, trip?.budgets]);
  const warning = trip ? spent > Number(trip.budgetTotal) : false;

  return (
    <div className="page-container pb-24">
      <div className="mb-8"><p className="font-semibold text-amber-600">Budget dashboard</p><h1 className="text-4xl font-black">{trip?.title ?? "Trip"} budget</h1><p className="mt-2 text-slate-500">Editable budgets, donut chart, per-category bars, and over-budget warnings.</p></div>
      {warning ? <div className="mb-5 flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 font-semibold text-rose-700"><AlertTriangle /> This trip is currently over budget.</div> : null}
      <div className="grid gap-5 lg:grid-cols-4">
        <Card><p className="text-sm font-semibold text-slate-500">Trip budget</p><p className="mt-2 text-3xl font-black">{currency(trip?.budgetTotal ?? 0)}</p></Card>
        <Card><p className="text-sm font-semibold text-slate-500">Spent</p><p className="mt-2 text-3xl font-black">{currency(spent)}</p></Card>
        <Card><p className="text-sm font-semibold text-slate-500">Remaining</p><p className="mt-2 text-3xl font-black">{currency(Number(trip?.budgetTotal ?? 0) - spent)}</p></Card>
        <Card><p className="text-sm font-semibold text-slate-500">Per-day</p><p className="mt-2 text-3xl font-black">{currency(spent / Math.max(1, trip?.stops?.length ?? 1))}</p></Card>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card><CardHeader><CardTitle>Cost breakdown</CardTitle><WalletCards className="text-amber-500" /></CardHeader><div className="h-80"><ResponsiveContainer><PieChart><Pie dataKey="spent" data={budgetData} outerRadius={110} label>{budgetData.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div></Card>
        <Card><CardHeader><CardTitle>Planned vs spent</CardTitle></CardHeader><div className="h-80"><ResponsiveContainer><BarChart data={budgetData}><XAxis dataKey="name" /><YAxis /><Tooltip /><Bar dataKey="planned" fill="#CBD5E1" radius={[8, 8, 0, 0]} /><Bar dataKey="spent" fill="#F59E0B" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div></Card>
      </div>
      <Card className="mt-6"><CardHeader><CardTitle>Stop breakdown table</CardTitle></CardHeader><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="text-slate-500"><th className="py-2">Stop</th><th>Activities</th><th>Estimate</th></tr></thead><tbody>{trip?.stops.map((stop) => <tr key={stop.id} className="border-t"><td className="py-3 font-bold">{stop.title}</td><td>{stop.activities.length}</td><td>{currency(stop.activities.reduce((sum, activity) => sum + Number(activity.cost), 0))}</td></tr>)}</tbody></table></div></Card>
    </div>
  );
}
