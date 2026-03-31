import { Check, Clock, Edit2, Trash2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "../ui/Badge";
import { Button } from "../ui/Button";
import type { Activity } from "../../types";
import {
  priorityConfig,
  statusConfig,
  dateLabel,
  toTimeString,
  isOverdue,
  cn,
} from "../../utils";

interface ActivityCardProps {
  activity: Activity;
  onEdit: (a: Activity) => void;
  onDelete: (id: number) => void;
  onComplete: (id: number) => void;
  compact?: boolean;
}

export const ActivityCard = ({
  activity,
  onEdit,
  onDelete,
  onComplete,
  compact = false,
}: ActivityCardProps) => {
  const pCfg = priorityConfig[activity.priority];
  const sCfg = statusConfig[activity.status];
  const overdue = isOverdue(activity.event_date, activity.status);
  const isDone = activity.status === "completed";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className={cn(
        "group relative bg-white/3 hover:bg-white/6 border border-white/8 rounded-2xl p-4",
        "border-l-4 transition-all duration-150",
        pCfg.border,
        isDone && "opacity-50",
        overdue && "border-l-rose-600 bg-rose-900/10"
      )}
    >
      {/* Deadline badge */}
      {activity.is_deadline && !isDone && (
        <span className="absolute top-3 right-3 flex items-center gap-1 text-xs text-rose-400">
          <AlertCircle size={12} />
          <span className="hidden sm:inline">Deadline</span>
        </span>
      )}

      <div className="flex flex-col gap-2">
        {/* Top row */}
        <div className="flex items-start gap-3">
          {/* Category dot */}
          <span
            className="mt-1 flex-shrink-0 w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: activity.category.color }}
          />

          {/* Title */}
          <div className="flex-1 min-w-0">
            <h3
              className={cn(
                "text-sm font-semibold text-slate-100 leading-snug",
                isDone && "line-through text-slate-500"
              )}
            >
              {activity.title}
            </h3>

            {!compact && activity.description && (
              <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                {activity.description}
              </p>
            )}
          </div>
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-2 ml-5">
          <span className="text-xs text-slate-500">
            {dateLabel(activity.event_date)}
          </span>

          {(activity.start_time || activity.is_all_day) && (
            <span className="flex items-center gap-1 text-xs text-slate-500">
              <Clock size={10} />
              {activity.is_all_day
                ? "Todo el día"
                : toTimeString(activity.start_time)}
            </span>
          )}

          <Badge className={pCfg.badge}>{pCfg.label}</Badge>
          <Badge className={sCfg.badge}>{sCfg.label}</Badge>

          <Badge className="bg-white/5 text-slate-500 border-white/8 text-[10px]">
            {activity.category.icon} {activity.category.name}
          </Badge>
        </div>
      </div>

      {/* Actions (visible on hover / always on mobile) */}
      <div
        className={cn(
          "flex items-center gap-1 mt-3 pt-3 border-t border-white/5",
          "sm:absolute sm:bottom-3 sm:right-3 sm:mt-0 sm:pt-0 sm:border-0",
          "sm:opacity-0 sm:group-hover:opacity-100 sm:transition-opacity"
        )}
      >
        {!isDone && (
          <Button
            variant="ghost"
            size="sm"
            icon={<Check size={14} className="text-emerald-400" />}
            onClick={() => onComplete(activity.id)}
            title="Marcar como completado"
          >
            <span className="sm:hidden text-emerald-400 text-xs">Completar</span>
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          icon={<Edit2 size={14} />}
          onClick={() => onEdit(activity)}
          title="Editar"
        >
          <span className="sm:hidden text-xs">Editar</span>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          icon={<Trash2 size={14} className="text-rose-400" />}
          onClick={() => onDelete(activity.id)}
          title="Eliminar"
        >
          <span className="sm:hidden text-rose-400 text-xs">Eliminar</span>
        </Button>
      </div>
    </motion.div>
  );
};
