import { useState } from "react";
import type * as React from "react";
import { Navigate, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Compass, Map, PlaneTakeoff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { useAuthStore } from "@/stores/authStore";

export function AuthPage() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [form, setForm] = useState({ name: "", email: "demo@traveloop.app", password: "traveloop123", confirm: "traveloop123" });
  const { login, register, loading, user } = useAuthStore();
  const navigate = useNavigate();
  if (user) return <Navigate to="/" replace />;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (mode === "signup" && form.password !== form.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    if (mode === "login") await login(form.email, form.password);
    else await register(form.name, form.email, form.password);
    toast.success(mode === "login" ? "Welcome back" : "Account created");
    navigate("/");
  }

  return (
    <main className="min-h-screen travel-gradient p-4">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[2rem] bg-white shadow-2xl lg:grid-cols-[1.05fr_0.95fr]">
        <section className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:block">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,158,11,0.35),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(14,165,233,0.32),transparent_28%)]" />
          <div className="relative z-10 flex h-full flex-col">
            <div className="flex items-center gap-3 text-2xl font-black"><Compass className="text-amber-400" /> Traveloop</div>
            <div className="my-auto">
              <div className="mb-4 inline-flex rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-amber-100"><Sparkles size={16} className="mr-2" /> AI-powered travel planning</div>
              <h1 className="max-w-xl text-6xl font-black leading-[0.95]">Plan trips that feel beautifully effortless.</h1>
              <p className="mt-6 max-w-lg text-lg text-slate-300">Create itineraries, manage budgets, discover cities, pack smarter, journal memories, and share public trip pages from one elegant workspace.</p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[PlaneTakeoff, Map, Compass].map((Icon, index) => (
                <div key={index} className="rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                  <Icon className="mb-3 text-amber-300" />
                  <div className="text-sm text-slate-300">Smart loop {index + 1}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="grid place-items-center p-6 sm:p-10">
          <Card className="w-full max-w-md border-0 shadow-none hover:shadow-none">
            <div className="mb-8 flex items-center justify-center gap-2 lg:hidden"><Compass className="text-amber-500" /><span className="text-2xl font-black">Traveloop</span></div>
            <div className="mb-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1">
              <button className={`rounded-lg py-2 text-sm font-bold ${mode === "login" ? "bg-white text-amber-700 shadow-sm" : "text-slate-500"}`} onClick={() => setMode("login")}>Login</button>
              <button className={`rounded-lg py-2 text-sm font-bold ${mode === "signup" ? "bg-white text-amber-700 shadow-sm" : "text-slate-500"}`} onClick={() => setMode("signup")}>Signup</button>
            </div>
            <h2 className="text-3xl font-black">{mode === "login" ? "Welcome back" : "Create your account"}</h2>
            <p className="mt-2 text-sm text-slate-500">Use demo@traveloop.app / traveloop123 after running the seed.</p>
            <form className="mt-6 grid gap-4" onSubmit={(event) => void submit(event)}>
              {mode === "signup" ? <div><Label>Name</Label><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required minLength={2} /></div> : null}
              <div><Label>Email</Label><Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required /></div>
              <div><Label>Password</Label><Input type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required minLength={8} /></div>
              {mode === "signup" ? <div><Label>Confirm password</Label><Input type="password" value={form.confirm} onChange={(event) => setForm({ ...form, confirm: event.target.value })} required /></div> : null}
              <Button type="submit" disabled={loading}>{loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}</Button>
            </form>
            {mode === "login" ? <button className="mt-4 text-sm font-semibold text-sky-600" onClick={() => toast.success("Password reset request sent if the email exists.")}>Forgot password?</button> : null}
          </Card>
        </section>
      </div>
    </main>
  );
}
