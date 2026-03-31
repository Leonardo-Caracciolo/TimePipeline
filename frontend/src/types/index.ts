export type Priority = "high" | "medium" | "low";
export type Status = "pending" | "in_progress" | "completed" | "cancelled";
export type RecurrenceType = "none" | "daily" | "weekly" | "monthly";

export interface Category {
  id: number;
  name: string;
  color: string;
  icon: string | null;
  is_system: boolean;
  created_at: string;
  activity_count: number;
}

export interface Activity {
  id: number;
  title: string;
  description: string | null;
  observations: string | null;
  category_id: number;
  category: Category;
  event_date: string; // ISO date "YYYY-MM-DD"
  start_time: string | null; // "HH:MM:SS"
  end_time: string | null;
  priority: Priority;
  status: Status;
  recurrence: RecurrenceType;
  recurrence_end_date: string | null;
  is_deadline: boolean;
  is_all_day: boolean;
  created_at: string;
  updated_at: string;
}

export interface ActivityListResponse {
  items: Activity[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface ActivityFilters {
  category_id?: number;
  priority?: Priority;
  status?: Status;
  date_from?: string;
  date_to?: string;
  search?: string;
  is_deadline?: boolean;
  page?: number;
  page_size?: number;
}

export interface ActivityCreate {
  title: string;
  description?: string;
  observations?: string;
  category_id: number;
  event_date: string;
  start_time?: string;
  end_time?: string;
  priority: Priority;
  status: Status;
  recurrence: RecurrenceType;
  recurrence_end_date?: string;
  is_deadline: boolean;
  is_all_day: boolean;
}

export type ActivityUpdate = Partial<ActivityCreate>;

export interface DashboardStats {
  today_count: number;
  upcoming_count: number;
  overdue_count: number;
  deadline_soon_count: number;
  by_category: { id: number; name: string; color: string; total: number }[];
  by_priority: Record<Priority, number>;
  by_status: Record<Status, number>;
  today_activities: Activity[];
  upcoming_activities: Activity[];
  overdue_activities: Activity[];
  deadlines_soon: Activity[];
}

export const PRIORITY_LABELS: Record<Priority, string> = {
  high: "Alta",
  medium: "Media",
  low: "Baja",
};

export const STATUS_LABELS: Record<Status, string> = {
  pending: "Pendiente",
  in_progress: "En progreso",
  completed: "Completado",
  cancelled: "Cancelado",
};

export const RECURRENCE_LABELS: Record<RecurrenceType, string> = {
  none: "Sin recurrencia",
  daily: "Diario",
  weekly: "Semanal",
  monthly: "Mensual",
};
