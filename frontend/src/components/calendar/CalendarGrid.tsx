import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { format, isSameDay, isSameMonth, isToday, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { useCalendarEvents } from "../../hooks";
import { useUIStore } from "../../store/uiStore";
import { getCalendarDays, cn } from "../../utils";
import type { Activity } from "../../types";

const DAY_NAMES = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

interface DayCellProps {
  day: Date;
  currentMonth: number;
  events: Activity[];
  onDayClick: (date: string) => void;
  onEventClick: (a: Activity) => void;
}

const DayCell = ({
  day,
  currentMonth,
  events,
  onDayClick,
  onEventClick,
}: DayCellProps) => {
  const isCurrentMonth = day.getMonth() === currentMonth;
  const today = isToday(day);
  const dayISO = format(day, "yyyy-MM-dd");
  const MAX_VISIBLE = 2;
  const visible = events.slice(0, MAX_VISIBLE);
  const overflow = events.length - MAX_VISIBLE;

  return (
    <div
      onClick={() => onDayClick(dayISO)}
      className={cn(
        "relative min-h-[80px] sm:min-h-[100px] p-1.5 sm:p-2 border border-white/5 cursor-pointer",
        "hover:bg-white/4 transition-colors duration-100",
        !isCurrentMonth && "opacity-35"
      )}
    >
      {/* Day number */}
      <div className="flex justify-end mb-1">
        <span
          className={cn(
            "inline-flex items-center justify-center w-6 h-6 text-xs font-medium rounded-full",
            today
              ? "bg-indigo-600 text-white font-bold"
              : "text-slate-400 hover:text-slate-200"
          )}
        >
          {day.getDate()}
        </span>
      </div>

      {/* Events */}
      <div className="flex flex-col gap-0.5">
        {visible.map((ev) => (
          <button
            key={ev.id}
            onClick={(e) => {
              e.stopPropagation();
              onEventClick(ev);
            }}
            className="w-full text-left truncate text-[10px] sm:text-xs px-1.5 py-0.5 rounded-md font-medium"
            style={{
              backgroundColor: `${ev.category.color}25`,
              color: ev.category.color,
              borderLeft: `2px solid ${ev.category.color}`,
            }}
          >
            {ev.is_deadline && "⚠ "}
            {ev.title}
          </button>
        ))}
        {overflow > 0 && (
          <span className="text-[10px] text-slate-500 px-1">+{overflow} más</span>
        )}
      </div>
    </div>
  );
};

export const CalendarGrid = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { openCreateModal, openEditModal } = useUIStore();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const dateFrom = format(new Date(year, month - 1, 20), "yyyy-MM-dd");
  const dateTo = format(new Date(year, month + 1, 10), "yyyy-MM-dd");

  const { data: events = [] } = useCalendarEvents(dateFrom, dateTo);

  const days = useMemo(() => getCalendarDays(year, month), [year, month]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, Activity[]>();
    for (const ev of events) {
      const key = ev.event_date;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return map;
  }, [events]);

  const navigate = (dir: -1 | 1) =>
    setCurrentDate(new Date(year, month + dir, 1));

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-2 py-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl hover:bg-white/8 text-slate-400 hover:text-slate-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <ChevronLeft size={20} />
        </button>

        <h2 className="text-lg font-semibold text-slate-100 capitalize">
          {format(currentDate, "MMMM yyyy", { locale: es })}
        </h2>

        <button
          onClick={() => navigate(1)}
          className="p-2 rounded-xl hover:bg-white/8 text-slate-400 hover:text-slate-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Day names */}
      <div className="grid grid-cols-7 border-b border-white/8">
        {DAY_NAMES.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-xs font-medium text-slate-500 uppercase tracking-wide"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-6 border-l border-t border-white/5">
        {days.map((day) => {
          const key = format(day, "yyyy-MM-dd");
          return (
            <DayCell
              key={key}
              day={day}
              currentMonth={month}
              events={eventsByDay.get(key) ?? []}
              onDayClick={(date) => openCreateModal(date)}
              onEventClick={openEditModal}
            />
          );
        })}
      </div>
    </div>
  );
};
