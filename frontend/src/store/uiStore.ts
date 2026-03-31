import { create } from "zustand";
import type { Activity, ActivityFilters } from "../types";

interface UIStore {
  // Modal state
  isActivityModalOpen: boolean;
  editingActivity: Activity | null;
  prefillDate: string | null;

  openCreateModal: (prefillDate?: string) => void;
  openEditModal: (activity: Activity) => void;
  closeActivityModal: () => void;

  // Filters
  activeFilters: ActivityFilters;
  setFilters: (filters: Partial<ActivityFilters>) => void;
  resetFilters: () => void;

  // Sidebar
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
}

const DEFAULT_FILTERS: ActivityFilters = {
  page: 1,
  page_size: 50,
};

export const useUIStore = create<UIStore>((set) => ({
  isActivityModalOpen: false,
  editingActivity: null,
  prefillDate: null,

  openCreateModal: (prefillDate) =>
    set({ isActivityModalOpen: true, editingActivity: null, prefillDate: prefillDate ?? null }),

  openEditModal: (activity) =>
    set({ isActivityModalOpen: true, editingActivity: activity, prefillDate: null }),

  closeActivityModal: () =>
    set({ isActivityModalOpen: false, editingActivity: null, prefillDate: null }),

  activeFilters: DEFAULT_FILTERS,
  setFilters: (filters) =>
    set((s) => ({ activeFilters: { ...s.activeFilters, ...filters, page: 1 } })),
  resetFilters: () => set({ activeFilters: DEFAULT_FILTERS }),

  isSidebarOpen: false,
  toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
  closeSidebar: () => set({ isSidebarOpen: false }),
}));
