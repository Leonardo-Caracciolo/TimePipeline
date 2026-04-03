import axios from "axios";
import type {
  Activity, ActivityCreate, ActivityFilters,
  ActivityListResponse, ActivityUpdate,
  Category, DashboardStats,
} from "../types";
import type { TokenResponse, LoginForm, RegisterForm } from "../types/auth";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
  timeout: 15_000,
});

// ── Request interceptor: attach JWT automatically ─────────────────────────────
apiClient.interceptors.request.use((config) => {
  // Import lazily to avoid circular deps
  const raw = localStorage.getItem("timepipeline-auth");
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      const token = parsed?.state?.token;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      // ignore malformed storage
    }
  }
  return config;
});

// ── Response interceptor: redirect to login on 401 ───────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("timepipeline-auth");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (payload: RegisterForm) =>
    apiClient.post<TokenResponse>("/auth/register", payload).then((r) => r.data),

  login: (payload: LoginForm) =>
    apiClient.post<TokenResponse>("/auth/login", payload).then((r) => r.data),

  me: () =>
    apiClient.get("/auth/me").then((r) => r.data),
};

// ── Categories ────────────────────────────────────────────────────────────────
export const categoriesApi = {
  list: () =>
    apiClient.get<Category[]>("/categories").then((r) => r.data),

  get: (id: number) =>
    apiClient.get<Category>(`/categories/${id}`).then((r) => r.data),

  create: (payload: { name: string; color: string; icon?: string }) =>
    apiClient.post<Category>("/categories", payload).then((r) => r.data),

  update: (id: number, payload: Partial<{ name: string; color: string; icon: string }>) =>
    apiClient.patch<Category>(`/categories/${id}`, payload).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete(`/categories/${id}`),
};

// ── Activities ────────────────────────────────────────────────────────────────
export const activitiesApi = {
  list: (filters: ActivityFilters = {}) => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== undefined && v !== null && v !== "")
    );
    return apiClient.get<ActivityListResponse>("/activities", { params }).then((r) => r.data);
  },

  calendar: (dateFrom: string, dateTo: string) =>
    apiClient
      .get<Activity[]>("/activities/calendar", {
        params: { date_from: dateFrom, date_to: dateTo },
      })
      .then((r) => r.data),

  get: (id: number) =>
    apiClient.get<Activity>(`/activities/${id}`).then((r) => r.data),

  create: (payload: ActivityCreate) =>
    apiClient.post<Activity>("/activities", payload).then((r) => r.data),

  update: (id: number, payload: ActivityUpdate) =>
    apiClient.patch<Activity>(`/activities/${id}`, payload).then((r) => r.data),

  delete: (id: number) =>
    apiClient.delete(`/activities/${id}`),

  complete: (id: number) =>
    apiClient.post<Activity>(`/activities/${id}/complete`).then((r) => r.data),
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const dashboardApi = {
  get: () =>
    apiClient.get<DashboardStats>("/dashboard").then((r) => r.data),
};
