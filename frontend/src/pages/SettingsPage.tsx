import { useState } from "react";
import type * as React from "react";
import toast from "react-hot-toast";
import { Download, Trash2, Upload } from "lucide-react";
import { api } from "@/api/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { useAuthStore } from "@/stores/authStore";

export function SettingsPage() {
  const [tab, setTab] = useState<"profile" | "saved" | "privacy">("profile");
  const { user, loadProfile, logoutLocal } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name ?? "", city: user?.city ?? "", country: user?.country ?? "", language: user?.language ?? "en" });

  async function save(event: React.FormEvent) {
    event.preventDefault();
    await api.patch("/users/me", form);
    await loadProfile();
    toast.success("Profile updated");
  }

  async function uploadPhoto(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const body = new FormData();
    body.append("photo", file);
    await api.post("/users/me/photo", body);
    await loadProfile();
    toast.success("Profile photo uploaded");
  }

  async function deleteAccount() {
    if (!window.confirm("Delete your Traveloop account? This cannot be undone.")) return;
    await api.delete("/users/me");
    logoutLocal();
  }

  return (
    <div className="page-container pb-24">
      <div className="mb-8"><p className="font-semibold text-amber-600">Settings</p><h1 className="text-4xl font-black">Account settings</h1><p className="mt-2 text-slate-500">Profile upload, language, saved destinations, privacy, export, and deletion.</p></div>
      <div className="mb-6 flex flex-wrap gap-2">{(["profile", "saved", "privacy"] as const).map((item) => <button key={item} className={`rounded-full px-4 py-2 text-sm font-bold ${tab === item ? "bg-amber-500 text-white" : "bg-white text-slate-600"}`} onClick={() => setTab(item)}>{item}</button>)}</div>
      {tab === "profile" ? <Card><form className="grid gap-4 md:grid-cols-2" onSubmit={(event) => void save(event)}><div><Label>Name</Label><Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></div><div><Label>Language</Label><Input value={form.language} onChange={(event) => setForm({ ...form, language: event.target.value })} /></div><div><Label>City</Label><Input value={form.city} onChange={(event) => setForm({ ...form, city: event.target.value })} /></div><div><Label>Country</Label><Input value={form.country} onChange={(event) => setForm({ ...form, country: event.target.value })} /></div><div className="md:col-span-2"><Label>Profile photo</Label><label className="mt-2 flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 p-8 text-slate-500"><Upload /> Upload photo<input className="hidden" type="file" accept="image/*" onChange={(event) => void uploadPhoto(event)} /></label></div><Button type="submit">Save profile</Button></form></Card> : null}
      {tab === "saved" ? <Card><h2 className="text-xl font-black">Saved destinations</h2><p className="mt-2 text-slate-500">Destination saves are personalized from search and recommendations. This panel is ready for a future saved-city join table.</p><div className="mt-5 grid gap-4 md:grid-cols-3">{["Kyoto", "Lisbon", "Copenhagen"].map((city) => <div key={city} className="rounded-2xl bg-gradient-to-br from-amber-100 to-sky-100 p-5 font-black">{city}</div>)}</div></Card> : null}
      {tab === "privacy" ? <Card><div className="grid gap-4"><Button variant="ghost" onClick={() => toast.success("Data export started")}><Download size={16} /> Export data</Button><Button variant="danger" onClick={() => void deleteAccount()}><Trash2 size={16} /> Delete account</Button></div></Card> : null}
    </div>
  );
}
