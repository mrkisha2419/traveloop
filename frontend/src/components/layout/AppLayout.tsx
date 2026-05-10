import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Bell, CalendarDays, ClipboardCheck, Compass, FileText, Home, LogOut, Menu, NotebookPen, PanelLeft, PieChart, Plus, Settings, Share2, Shield, WalletCards, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/stores/authStore";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Dashboard", icon: Home },
  { to: "/create-trip", label: "Create Trip", icon: Plus },
  { to: "/trips", label: "My Trips", icon: CalendarDays },
  { to: "/discover", label: "Discover", icon: Compass },
  { to: "/itinerary", label: "Builder", icon: PanelLeft },
  { to: "/itinerary-view", label: "Itinerary View", icon: Compass },
  { to: "/budget", label: "Budget", icon: PieChart },
  { to: "/expenses", label: "Expenses", icon: WalletCards },
  { to: "/packing", label: "Packing", icon: ClipboardCheck },
  { to: "/notes", label: "Notes", icon: NotebookPen },
  { to: "/share/demo-portugal-loop", label: "Public Share", icon: Share2 },
  { to: "/settings", label: "Settings", icon: Settings },
  { to: "/admin", label: "Admin", icon: Shield }
];

export function AppLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const sidebar = (
    <aside className="flex h-full flex-col border-r border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
      <div className="mb-7 flex items-center justify-between">
        <button className="flex items-center gap-3" onClick={() => navigate("/")}>
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-amber-400 to-sky-500 text-white shadow-md">
            <Compass size={23} />
          </span>
          <span className="text-xl font-black text-slate-900">Traveloop</span>
        </button>
        <button className="lg:hidden" onClick={() => setOpen(false)} aria-label="Close navigation"><X /></button>
      </div>
      <nav className="grid gap-1">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={({ isActive }) => cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-500 transition-all duration-200 hover:bg-amber-50 hover:text-amber-700",
              isActive && "bg-amber-100 text-amber-800 shadow-sm"
            )}
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto rounded-2xl bg-slate-900 p-4 text-white">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-white/15 font-bold">{user?.name?.slice(0, 1) ?? "T"}</div>
          <div className="min-w-0">
            <div className="truncate font-bold">{user?.name ?? "Traveler"}</div>
            <div className="truncate text-xs text-slate-300">{user?.email}</div>
          </div>
        </div>
        <Button variant="ghost" className="mt-4 w-full border-white/20 bg-white/10 text-white hover:bg-white/20" onClick={() => void logout()}>
          <LogOut size={16} /> Sign out
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button className="flex items-center gap-2 font-black" onClick={() => navigate("/")}>
            <Compass className="text-amber-500" /> Traveloop
          </button>
          <button onClick={() => setOpen(true)} aria-label="Open navigation"><Menu /></button>
        </div>
      </header>
      <div className="grid lg:grid-cols-[280px_1fr]">
        <div className="hidden lg:block lg:h-screen lg:sticky lg:top-0">{sidebar}</div>
        <div className={cn("fixed inset-y-0 left-0 z-50 w-72 transition lg:hidden", open ? "translate-x-0" : "-translate-x-full")}>{sidebar}</div>
        {open ? <button className="fixed inset-0 z-40 bg-slate-950/30 lg:hidden" onClick={() => setOpen(false)} aria-label="Close overlay" /> : null}
        <main className="min-w-0">
          <div className="sticky top-0 z-20 hidden border-b border-slate-200 bg-white/80 px-8 py-4 backdrop-blur lg:flex lg:items-center lg:justify-between">
            <div className="text-sm font-semibold text-slate-500">Plan, budget, pack, journal, and share every trip.</div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" className="h-10 w-10 p-0" aria-label="Notifications"><Bell size={18} /></Button>
              <Button onClick={() => navigate("/create-trip")}><Plus size={18} /> New trip</Button>
            </div>
          </div>
          <Outlet />
        </main>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-slate-200 bg-white/95 px-2 py-2 shadow-2xl backdrop-blur lg:hidden">
        {nav.slice(0, 5).map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => cn("grid place-items-center gap-1 rounded-xl py-2 text-[11px] font-semibold text-slate-500", isActive && "bg-amber-100 text-amber-700")}>
            <item.icon size={18} />
            {item.label.replace("Dashboard", "Home").replace("Create Trip", "Create")}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
