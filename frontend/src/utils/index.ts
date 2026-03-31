import {
  format,
  formatDistanceToNow,
  isToday,
  isTomorrow,
  isPast,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
} from "date-fns";
import { es } from "date-fns/locale";
import type { Priority, Status } from "../types";

// ── Date helpers ──────────────────────────────────────────────────────────────

export const toLocaleDateString = (iso: string) =>
  format(parseISO(iso), "d MMM yyyy", { locale: es });

export const toRelative = (iso: string) =>
  formatDistanceToNow(parseISO(iso), { addSuffix: true, locale: es });

export const toTimeString = (timeStr: string | null) => {
  if (!timeStr) return null;
  return timeStr.slice(0, 5); // "HH:MM"
};

export const dateLabel = (iso: string): string => {
  const d = parseISO(iso);
  if (isToday(d)) return "Hoy";
  if (isTomorrow(d)) return "Mañana";
  return format(d, "EEE d MMM", { locale: es });
};

export const isOverdue = (iso: string, status: Status) =>
  status === "pending" && isPast(parseISO(iso)) && !isToday(parseISO(iso));

export const todayISO = () => format(new Date(), "yyyy-MM-dd");

export const getCalendarDays = (year: number, month: number) => {
  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(monthStart);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: calStart, end: calEnd });
};

export { isSameMonth, isSameDay, isToday, format, parseISO };

// ── Priority styling ──────────────────────────────────────────────────────────

export const priorityConfig: Record<
  Priority,
  { label: string; dot: string; badge: string; border: string }
> = {
  high: {
    label: "Alta",
    dot: "bg-rose-500",
    badge: "bg-rose-500/10 text-rose-400 border-rose-500/20",
    border: "border-l-rose-500",
  },
  medium: {
    label: "Media",
    dot: "bg-amber-400",
    badge: "bg-amber-400/10 text-amber-400 border-amber-400/20",
    border: "border-l-amber-400",
  },
  low: {
    label: "Baja",
    dot: "bg-emerald-500",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    border: "border-l-emerald-500",
  },
};

// ── Status styling ────────────────────────────────────────────────────────────

export const statusConfig: Record<
  Status,
  { label: string; badge: string; icon: string }
> = {
  pending: {
    label: "Pendiente",
    badge: "bg-slate-500/10 text-slate-400 border-slate-500/20",
    icon: "⏳",
  },
  in_progress: {
    label: "En progreso",
    badge: "bg-sky-500/10 text-sky-400 border-sky-500/20",
    icon: "▶",
  },
  completed: {
    label: "Completado",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    icon: "✓",
  },
  cancelled: {
    label: "Cancelado",
    badge: "bg-neutral-500/10 text-neutral-500 border-neutral-500/20",
    icon: "✕",
  },
};

// ── clsx-like helper (avoid extra dep for simple cases) ──────────────────────
export const cn = (...classes: (string | undefined | false | null)[]) =>
  classes.filter(Boolean).join(" ");
