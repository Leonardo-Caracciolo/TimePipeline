import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { activitiesApi, categoriesApi, dashboardApi } from "../api";
import type {
  ActivityCreate,
  ActivityFilters,
  ActivityUpdate,
} from "../types";

// ── Query Keys (typed constants prevent typos) ────────────────────────────────
export const QK = {
  dashboard: ["dashboard"] as const,
  activities: (filters?: ActivityFilters) =>
    filters ? ["activities", filters] : (["activities"] as const),
  activity: (id: number) => ["activities", id] as const,
  calendar: (from: string, to: string) => ["calendar", from, to] as const,
  categories: ["categories"] as const,
  category: (id: number) => ["categories", id] as const,
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const useDashboard = () =>
  useQuery({
    queryKey: QK.dashboard,
    queryFn: dashboardApi.get,
    staleTime: 30_000,
  });

// ── Categories ────────────────────────────────────────────────────────────────
export const useCategories = () =>
  useQuery({
    queryKey: QK.categories,
    queryFn: categoriesApi.list,
    staleTime: 60_000 * 5,
  });

export const useCreateCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: categoriesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.categories }),
  });
};

export const useDeleteCategory = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoriesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QK.categories }),
  });
};

// ── Activities ────────────────────────────────────────────────────────────────
export const useActivities = (filters: ActivityFilters = {}) =>
  useQuery({
    queryKey: QK.activities(filters),
    queryFn: () => activitiesApi.list(filters),
    staleTime: 15_000,
    placeholderData: (prev) => prev,
  });

export const useCalendarEvents = (dateFrom: string, dateTo: string) =>
  useQuery({
    queryKey: QK.calendar(dateFrom, dateTo),
    queryFn: () => activitiesApi.calendar(dateFrom, dateTo),
    staleTime: 15_000,
    enabled: !!dateFrom && !!dateTo,
  });

export const useActivity = (id: number) =>
  useQuery({
    queryKey: QK.activity(id),
    queryFn: () => activitiesApi.get(id),
    enabled: id > 0,
  });

export const useCreateActivity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ActivityCreate) => activitiesApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activities"] });
      qc.invalidateQueries({ queryKey: ["calendar"] });
      qc.invalidateQueries({ queryKey: QK.dashboard });
    },
  });
};

export const useUpdateActivity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ActivityUpdate }) =>
      activitiesApi.update(id, payload),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["activities"] });
      qc.invalidateQueries({ queryKey: ["calendar"] });
      qc.invalidateQueries({ queryKey: QK.dashboard });
      qc.setQueryData(QK.activity(updated.id), updated);
    },
  });
};

export const useDeleteActivity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => activitiesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["activities"] });
      qc.invalidateQueries({ queryKey: ["calendar"] });
      qc.invalidateQueries({ queryKey: QK.dashboard });
    },
  });
};

export const useCompleteActivity = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => activitiesApi.complete(id),
    onSuccess: (updated) => {
      qc.invalidateQueries({ queryKey: ["activities"] });
      qc.invalidateQueries({ queryKey: QK.dashboard });
      qc.setQueryData(QK.activity(updated.id), updated);
    },
  });
};
