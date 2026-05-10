import { useEffect, useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Users, Map, Share2, WalletCards } from "lucide-react";
import { api } from "@/api/client";
import { Card, CardHeader, CardTitle } from "@/components/ui/Card";
import { currency } from "@/lib/utils";

type Analytics = {
  kpis: { users: number; trips: number; publicTrips: number; totalExpenses: number };
  popularDestinations: Array<{ city?: { name: string }; count: number }>;
};

export function AdminDashboard() {
  const [data, setData] = useState<Analytics | null>(null);
  const [users, setUsers] = useState<Array<{ id: string; name: string; email: string; role: string; _count: { trips: number } }>>([]);

  useEffect(() => {
    void api.get<Analytics>("/admin/analytics").then((response) => setData(response.data));
    void api.get<typeof users>("/admin/users").then((response) => setUsers(response.data));
  }, []);

  const kpis = [
    { label: "Users", value: data?.kpis.users ?? 0, icon: Users },
    { label: "Trips", value: data?.kpis.trips ?? 0, icon: Map },
    { label: "Public trips", value: data?.kpis.publicTrips ?? 0, icon: Share2 },
    { label: "Tracked spend", value: currency(data?.kpis.totalExpenses ?? 0), icon: WalletCards }
  ];

  return (
    <div className="page-container pb-24">
      <div className="mb-8"><p className="font-semibold text-amber-600">Admin only</p><h1 className="text-4xl font-black">Analytics dashboard</h1><p className="mt-2 text-slate-500">KPIs, charts, user analytics, trip tables, and filters.</p></div>
      <div className="grid gap-5 lg:grid-cols-4">{kpis.map(({ label, value, icon: Icon }) => <Card key={label}><div className="flex justify-between"><div><p className="text-sm font-semibold text-slate-500">{label}</p><p className="mt-2 text-3xl font-black">{value}</p></div><Icon className="text-amber-500" /></div></Card>)}</div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Card><CardHeader><CardTitle>Popular destinations</CardTitle></CardHeader><div className="h-80"><ResponsiveContainer><BarChart data={data?.popularDestinations ?? []}><XAxis dataKey="city.name" /><YAxis /><Tooltip /><Bar dataKey="count" fill="#0EA5E9" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer></div></Card>
        <Card><CardHeader><CardTitle>Users table</CardTitle></CardHeader><div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="text-slate-500"><th className="py-2">Name</th><th>Email</th><th>Role</th><th>Trips</th></tr></thead><tbody>{users.map((user) => <tr key={user.id} className="border-t"><td className="py-3 font-bold">{user.name}</td><td>{user.email}</td><td>{user.role}</td><td>{user._count.trips}</td></tr>)}</tbody></table></div></Card>
      </div>
    </div>
  );
}
