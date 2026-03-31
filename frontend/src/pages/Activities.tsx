import { useState } from "react";
import { Search, Filter, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useActivities, useCategories, useCompleteActivity, useDeleteActivity } from "../hooks";
import { useUIStore } from "../store/uiStore";
import { ActivityCard } from "../components/activities/ActivityCard";
import { ActivityModal } from "../components/activities/ActivityModal";
import { Button } from "../components/ui/Button";
import { Input, Select } from "../components/ui/FormFields";
import type { ActivityFilters, Priority, Status } from "../types";

export const ActivitiesPage = () => {
  const { openCreateModal, openEditModal } = useUIStore();
  const completeMutation = useCompleteActivity();
  const deleteMutation = useDeleteActivity();
  const { data: categories = [] } = useCategories();

  const [filters, setFilters] = useState<ActivityFilters>({
    page: 1,
    page_size: 20,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState("");

  const appliedFilters: ActivityFilters = {
    ...filters,
    search: search || undefined,
  };

  const { data, isLoading } = useActivities(appliedFilters);

  const update = (patch: Partial<ActivityFilters>) =>
    setFilters((f) => ({ ...f, ...patch, page: 1 }));

  const categoryOptions = [
    { value: "", label: "Todas las categorías" },
    ...categories.map((c) => ({ value: c.id, label: `${c.icon ?? ""} ${c.name}` })),
  ];

  return (
    <div className="flex flex-col gap-5 pb-24 md:pb-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-100 tracking-tight hidden md:block">
          Actividades
        </h1>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus size={14} />}
          onClick={() => openCreateModal()}
          className="hidden md:inline-flex"
        >
          Nueva
        </Button>
      </div>

      {/* Search + filter toggle */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
          />
          <input
            type="search"
            placeholder="Buscar actividades..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/60 transition-all min-h-[44px]"
          />
        </div>
        <button
          onClick={() => setShowFilters((v) => !v)}
          className={`p-2.5 rounded-xl border transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
            showFilters
              ? "bg-indigo-600/20 border-indigo-500/20 text-indigo-400"
              : "bg-white/5 border-white/10 text-slate-400 hover:text-slate-200"
          }`}
        >
          <Filter size={16} />
        </button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-white/3 border border-white/8 rounded-2xl">
          <Select
            label="Categoría"
            options={categoryOptions}
            value={filters.category_id ?? ""}
            onChange={(e) =>
              update({ category_id: e.target.value ? Number(e.target.value) : undefined })
            }
          />
          <Select
            label="Prioridad"
            options={[
              { value: "", label: "Todas" },
              { value: "high", label: "Alta" },
              { value: "medium", label: "Media" },
              { value: "low", label: "Baja" },
            ]}
            value={filters.priority ?? ""}
            onChange={(e) => update({ priority: (e.target.value as Priority) || undefined })}
          />
          <Select
            label="Estado"
            options={[
              { value: "", label: "Todos" },
              { value: "pending", label: "Pendiente" },
              { value: "in_progress", label: "En progreso" },
              { value: "completed", label: "Completado" },
              { value: "cancelled", label: "Cancelado" },
            ]}
            value={filters.status ?? ""}
            onChange={(e) => update({ status: (e.target.value as Status) || undefined })}
          />
          <Input
            label="Desde"
            type="date"
            value={filters.date_from ?? ""}
            onChange={(e) => update({ date_from: e.target.value || undefined })}
          />
          <Input
            label="Hasta"
            type="date"
            value={filters.date_to ?? ""}
            onChange={(e) => update({ date_to: e.target.value || undefined })}
          />
          <div className="flex items-end">
            <Button
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={() => {
                setFilters({ page: 1, page_size: 20 });
                setSearch("");
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        </div>
      )}

      {/* Count */}
      {data && (
        <p className="text-xs text-slate-500">
          {data.total} {data.total === 1 ? "actividad" : "actividades"}
        </p>
      )}

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : data?.items.length === 0 ? (
        <div className="flex flex-col items-center py-20 gap-3 text-center">
          <span className="text-4xl">📭</span>
          <p className="text-slate-400 font-medium">Sin actividades</p>
          <p className="text-slate-600 text-sm">Probá cambiando los filtros</p>
        </div>
      ) : (
        <AnimatePresence mode="popLayout">
          <div className="flex flex-col gap-2">
            {data?.items.map((a) => (
              <ActivityCard
                key={a.id}
                activity={a}
                onEdit={openEditModal}
                onDelete={(id) => deleteMutation.mutate(id)}
                onComplete={(id) => completeMutation.mutate(id)}
              />
            ))}
          </div>
        </AnimatePresence>
      )}

      {/* Pagination */}
      {data && data.total_pages > 1 && (
        <div className="flex items-center justify-center gap-4 pt-4">
          <Button
            variant="secondary"
            size="sm"
            icon={<ChevronLeft size={14} />}
            disabled={filters.page === 1}
            onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
          >
            Anterior
          </Button>
          <span className="text-sm text-slate-500">
            {filters.page} / {data.total_pages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
            disabled={filters.page === data.total_pages}
          >
            Siguiente
            <ChevronRight size={14} />
          </Button>
        </div>
      )}

      <ActivityModal />
    </div>
  );
};
