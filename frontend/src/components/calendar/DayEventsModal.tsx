import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";
import { Plus, Clock, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { priorityConfig, statusConfig, toTimeString, cn } from "../../utils";
import type { Activity } from "../../types";

interface DayEventsModalProps {
  isOpen: boolean;
  date: string;
  events: Activity[];
  onClose: () => void;
  onCreateNew: (date: string) => void;
  onEditEvent: (activity: Activity) => void;
}

export const DayEventsModal = ({
  isOpen,
  date,
  events,
  onClose,
  onCreateNew,
  onEditEvent,
}: DayEventsModalProps) => {
  const dateLabel = date
    ? format(parseISO(date), "EEEE d 'de' MMMM", { locale: es })
    : "";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className={cn(
              "relative w-full bg-slate-900 border border-white/10 shadow-2xl z-10",
              "rounded-t-2xl sm:rounded-2xl",
              "max-h-[85dvh] flex flex-col",
              "sm:max-w-md"
            )}
          >
            {/* Handle (mobile) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 bg-white/20 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/8">
              <div>
                <h2 className="text-base font-semibold text-slate-100 capitalize">
                  {dateLabel}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  {events.length} {events.length === 1 ? "actividad" : "actividades"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/8 text-slate-400 hover:text-slate-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            {/* Event list */}
            <div className="flex-1 overflow-y-auto overscroll-contain px-5 py-4 flex flex-col gap-3">
              {events.map((ev) => {
                const pCfg = priorityConfig[ev.priority];
                const sCfg = statusConfig[ev.status];
                return (
                  <button
                    key={ev.id}
                    onClick={() => { onEditEvent(ev); onClose(); }}
                    className={cn(
                      "w-full text-left bg-white/3 hover:bg-white/6 border border-white/8 rounded-xl p-4",
                      "border-l-4 transition-all duration-150",
                      pCfg.border
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className="mt-1 flex-shrink-0 w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: ev.category.color }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-slate-100 leading-snug">
                            {ev.title}
                          </p>
                          {ev.is_deadline && (
                            <AlertCircle size={12} className="text-rose-400 flex-shrink-0" />
                          )}
                        </div>

                        {ev.description && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                            {ev.description}
                          </p>
                        )}

                        <div className="flex flex-wrap items-center gap-2 mt-2">
                          {(ev.start_time || ev.is_all_day) && (
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <Clock size={10} />
                              {ev.is_all_day ? "Todo el día" : toTimeString(ev.start_time)}
                              {ev.end_time && !ev.is_all_day && ` → ${toTimeString(ev.end_time)}`}
                            </span>
                          )}
                          <Badge className={pCfg.badge}>{pCfg.label}</Badge>
                          <Badge className={sCfg.badge}>{sCfg.label}</Badge>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer */}
            <div className="px-5 py-4 border-t border-white/8">
              <Button
                variant="primary"
                icon={<Plus size={15} />}
                className="w-full"
                onClick={() => { onCreateNew(date); onClose(); }}
              >
                Nueva actividad para este día
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
