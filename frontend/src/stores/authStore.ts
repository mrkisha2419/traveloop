import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/api/client";
import type { AuthResponse, User } from "@/types";

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  setSession: (session: AuthResponse) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  logoutLocal: () => void;
  loadProfile: () => Promise<void>;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      loading: false,
      setSession: (session) => set({ user: session.user, accessToken: session.accessToken, refreshToken: session.refreshToken }),
      login: async (email, password) => {
        set({ loading: true });
        try {
          const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
          get().setSession(data);
        } finally {
          set({ loading: false });
        }
      },
      register: async (name, email, password) => {
        set({ loading: true });
        try {
          const { data } = await api.post<AuthResponse>("/auth/register", { name, email, password });
          get().setSession(data);
        } finally {
          set({ loading: false });
        }
      },
      logout: async () => {
        const refreshToken = get().refreshToken;
        await api.post("/auth/logout", { refreshToken }).catch(() => undefined);
        get().logoutLocal();
      },
      logoutLocal: () => set({ user: null, accessToken: null, refreshToken: null }),
      loadProfile: async () => {
        const { data } = await api.get<User>("/users/me");
        set({ user: data });
      }
    }),
    { name: "traveloop-auth" }
  )
);
