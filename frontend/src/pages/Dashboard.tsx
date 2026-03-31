import { CalendarClock, AlertTriangle, TrendingUp, CheckCircle2, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { useDashboard, useCompleteActivity, useDeleteActivity } from "../hooks";
import { useUIStore } from "../store/uiStore";
import { StatCard } from "../components/dashboard/StatCard";
import { ActivityCard } from "../components/activities/ActivityCard";
import { Button } from "../components/ui/Button";
import { cn } from "../utils";

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
    {children}
  </h2>
);

export const Dashboard = () => {
  const { data, isLoading } = useDashboard();
  const { openCreateModal, openEditModal } = useUIStore();
  const completeMutation = useCompleteActivity();
  const deleteMutation = useDeleteActivity();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto pb-24 md:pb-8">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            Buenos días 👋
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Tenés{" "}
            <span className="text-indigo-400 font-medium">{data.today_count}</span>{" "}
            {data.today_count === 1 ? "actividad" : "actividades"} para hoy
          </p>
        </div>
        <Button
          variant="primary"
          icon={<Plus size={16} />}
          onClick={() => openCreateModal()}
          className="hidden md:inline-flex"
        >
          Nueva actividad
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Hoy" value={data.today_count} icon={CalendarClock} color="indigo" delay={0} />
        <StatCard label="Esta semana" value={data.upcoming_count} icon={TrendingUp} color="sky" delay={0.05} />
        <StatCard label="Vencidas" value={data.overdue_count} icon={AlertTriangle} color="rose" delay={0.1} />
        <StatCard label="Deadlines próximos" value={data.deadline_soon_count} icon={CheckCircle2} color="amber" delay={0.15} />
      </div>

      {/* Category breakdown */}
      {data.by_category.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/3 border border-white/8 rounded-2xl p-5"
        >
          <SectionTitle>Por categoría</SectionTitle>
          <div className="flex flex-col gap-3">
            {data.by_category.map((cat) => {
              const max = Math.max(...data.by_category.map((c) => c.total));
              const pct = Math.round((cat.total / max) * 100);
              return (
                <div key={cat.id} className="flex items-center gap-3">
                  <span className="text-xs text-slate-400 w-32 truncate">{cat.name}</span>
                  <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: cat.color }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 w-6 text-right">{cat.total}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Deadlines soon */}
      {data.deadlines_soon.length > 0 && (
        <div>
          <SectionTitle>⚠ Deadlines próximos (7 días)</SectionTitle>
          <div className="flex flex-col gap-2">
            {data.deadlines_soon.map((a) => (
              <ActivityCard
                key={a.id}
                activity={a}
                onEdit={openEditModal}
                onDelete={(id) => deleteMutation.mutate(id)}
                onComplete={(id) => completeMutation.mutate(id)}
                compact
              />
            ))}
          </div>
        </div>
      )}

      {/* Today */}
      {data.today_activities.length > 0 && (
        <div>
          <SectionTitle>Hoy</SectionTitle>
          <div className="flex flex-col gap-2">
            {data.today_activities.map((a) => (
              <ActivityCard
                key={a.id}
                activity={a}
                onEdit={openEditModal}
                onDelete={(id) => deleteMutation.mutate(id)}
                onComplete={(id) => completeMutation.mutate(id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming */}
      {data.upcoming_activities.length > 0 && (
        <div>
          <SectionTitle>Próximos 7 días</SectionTitle>
          <div className="flex flex-col gap-2">
            {data.upcoming_activities.map((a) => (
              <ActivityCard
                key={a.id}
                activity={a}
                onEdit={openEditModal}
                onDelete={(id) => deleteMutation.mutate(id)}
                onComplete={(id) => completeMutation.mutate(id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Overdue */}
      {data.overdue_activities.length > 0 && (
        <div>
          <SectionTitle>🔴 Vencidas</SectionTitle>
          <div className="flex flex-col gap-2">
            {data.overdue_activities.map((a) => (
              <ActivityCard
                key={a.id}
                activity={a}
                onEdit={openEditModal}
                onDelete={(id) => deleteMutation.mutate(id)}
                onComplete={(id) => completeMutation.mutate(id)}
              />
            ))}
          </div>
        </div>
      )}

      {data.today_count === 0 &&
        data.upcoming_count === 0 &&
        data.overdue_count === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
            <span className="text-5xl">🎉</span>
            <p className="text-slate-400 text-lg font-medium">Todo limpio</p>
            <p className="text-slate-600 text-sm">No tenés actividades pendientes</p>
            <Button variant="primary" icon={<Plus size={16} />} onClick={() => openCreateModal()}>
              Crear actividad
            </Button>
          </div>
        )}
    </div>
  );
};
