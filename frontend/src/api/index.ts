import axios from "axios";
import type {
  Activity,
  ActivityCreate,
  ActivityFilters,
  ActivityListResponse,
  ActivityUpdate,
  Category,
  DashboardStats,
} from "../types";

const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  headers: { "Content-Type": "application/json" },
  timeout: 10_000,
});

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
    return apiClient
      .get<ActivityListResponse>("/activities", { params })
      .then((r) => r.data);
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
