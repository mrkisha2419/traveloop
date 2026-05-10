import axios from "axios";
import toast from "react-hot-toast";

const API_BASE = import.meta.env.VITE_API_URL ?? "/api";

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true
});

function readSession() {
  const raw = localStorage.getItem("traveloop-auth");
  if (!raw) return { accessToken: null, refreshToken: null };
  try {
    const parsed = JSON.parse(raw) as { state?: { accessToken?: string; refreshToken?: string } };
    return {
      accessToken: parsed.state?.accessToken ?? null,
      refreshToken: parsed.state?.refreshToken ?? null
    };
  } catch {
    return { accessToken: null, refreshToken: null };
  }
}

function patchSession(session: { accessToken: string; refreshToken: string; user: unknown }) {
  const raw = localStorage.getItem("traveloop-auth");
  const parsed = raw ? JSON.parse(raw) : { state: {} };
  parsed.state = { ...parsed.state, ...session };
  localStorage.setItem("traveloop-auth", JSON.stringify(parsed));
}

api.interceptors.request.use((config) => {
  const { accessToken } = readSession();
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const { refreshToken } = readSession();
    if (error.response?.status === 401 && refreshToken && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post(`${API_BASE}/auth/refresh`, { refreshToken });
        patchSession(data);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem("traveloop-auth");
      }
    }
    toast.error(error.response?.data?.message ?? "Something went wrong");
    return Promise.reject(error);
  }
);
