import { create } from "zustand";
import { api } from "@/api/client";
import type { ChecklistItem, City, Expense, Note, Stop, StopActivity, Trip } from "@/types";

type TripState = {
  trips: Trip[];
  activeTrip: Trip | null;
  cities: City[];
  loading: boolean;
  autosave: "saved" | "saving" | "error";
  fetchTrips: (params?: Record<string, string>) => Promise<void>;
  fetchTrip: (id: string) => Promise<void>;
  createTrip: (payload: Record<string, unknown>) => Promise<Trip>;
  updateTrip: (id: string, payload: Record<string, unknown>) => Promise<void>;
  shareTrip: (id: string) => Promise<void>;
  addStop: (tripId: string, payload: Record<string, unknown>) => Promise<Stop>;
  reorderStops: (tripId: string, stopIds: string[]) => Promise<void>;
  deleteStop: (tripId: string, stopId: string) => Promise<void>;
  addActivity: (tripId: string, stopId: string, payload: Record<string, unknown>) => Promise<StopActivity>;
  updateActivity: (tripId: string, activityId: string, payload: Record<string, unknown>) => Promise<void>;
  deleteActivity: (tripId: string, activityId: string) => Promise<void>;
  searchCities: (q?: string) => Promise<void>;
  generateItinerary: (tripId: string, prompt: string) => Promise<void>;
  addChecklistItem: (tripId: string, payload: Record<string, unknown>) => Promise<ChecklistItem>;
  updateChecklistItem: (tripId: string, itemId: string, payload: Record<string, unknown>) => Promise<void>;
  addNote: (tripId: string, payload: Record<string, unknown>) => Promise<Note>;
  updateNote: (tripId: string, noteId: string, payload: Record<string, unknown>) => Promise<void>;
  addExpense: (tripId: string, payload: Record<string, unknown>) => Promise<Expense>;
};

export const useTripStore = create<TripState>((set, get) => ({
  trips: [],
  activeTrip: null,
  cities: [],
  loading: false,
  autosave: "saved",
  fetchTrips: async (params) => {
    set({ loading: true });
    try {
      const { data } = await api.get<Trip[]>("/trips", { params });
      set({ trips: data });
    } finally {
      set({ loading: false });
    }
  },
  fetchTrip: async (id) => {
    set({ loading: true });
    try {
      const { data } = await api.get<Trip>(`/trips/${id}`);
      set({ activeTrip: data });
    } finally {
      set({ loading: false });
    }
  },
  createTrip: async (payload) => {
    const { data } = await api.post<Trip>("/trips", payload);
    set((state) => ({ trips: [data, ...state.trips], activeTrip: data }));
    return data;
  },
  updateTrip: async (id, payload) => {
    set({ autosave: "saving" });
    try {
      const { data } = await api.patch<Trip>(`/trips/${id}`, payload);
      set((state) => ({ activeTrip: data, trips: state.trips.map((trip) => (trip.id === id ? data : trip)), autosave: "saved" }));
    } catch (error) {
      set({ autosave: "error" });
      throw error;
    }
  },
  shareTrip: async (id) => {
    const { data } = await api.post<Trip>(`/trips/${id}/share`);
    set((state) => ({ activeTrip: data, trips: state.trips.map((trip) => (trip.id === id ? data : trip)) }));
  },
  addStop: async (tripId, payload) => {
    const { data } = await api.post<Stop>(`/trips/${tripId}/stops`, payload);
    await get().fetchTrip(tripId);
    return data;
  },
  reorderStops: async (tripId, stopIds) => {
    await api.patch(`/trips/${tripId}/stops/reorder`, { stopIds });
    await get().fetchTrip(tripId);
  },
  deleteStop: async (tripId, stopId) => {
    await api.delete(`/trips/${tripId}/stops/${stopId}`);
    await get().fetchTrip(tripId);
  },
  addActivity: async (tripId, stopId, payload) => {
    const { data } = await api.post<StopActivity>(`/trips/${tripId}/stops/${stopId}/activities`, payload);
    await get().fetchTrip(tripId);
    return data;
  },
  updateActivity: async (tripId, activityId, payload) => {
    await api.patch(`/trips/${tripId}/activities/${activityId}`, payload);
    await get().fetchTrip(tripId);
  },
  deleteActivity: async (tripId, activityId) => {
    await api.delete(`/trips/${tripId}/activities/${activityId}`);
    await get().fetchTrip(tripId);
  },
  searchCities: async (q) => {
    const { data } = await api.get<City[]>("/search/cities", { params: { q } });
    set({ cities: data });
  },
  generateItinerary: async (tripId, prompt) => {
    const { data } = await api.post<Trip>(`/ai/trips/${tripId}/itinerary`, { prompt });
    set({ activeTrip: data });
  },
  addChecklistItem: async (tripId, payload) => {
    const { data } = await api.post<ChecklistItem>(`/trips/${tripId}/checklist`, payload);
    await get().fetchTrip(tripId);
    return data;
  },
  updateChecklistItem: async (tripId, itemId, payload) => {
    await api.patch(`/trips/${tripId}/checklist/${itemId}`, payload);
    await get().fetchTrip(tripId);
  },
  addNote: async (tripId, payload) => {
    const { data } = await api.post<Note>(`/trips/${tripId}/notes`, payload);
    await get().fetchTrip(tripId);
    return data;
  },
  updateNote: async (tripId, noteId, payload) => {
    await api.patch(`/trips/${tripId}/notes/${noteId}`, payload);
    await get().fetchTrip(tripId);
  },
  addExpense: async (tripId, payload) => {
    const { data } = await api.post<Expense>(`/trips/${tripId}/expenses`, payload);
    await get().fetchTrip(tripId);
    return data;
  }
}));
