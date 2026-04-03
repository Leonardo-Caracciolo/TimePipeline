import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AlertTriangle } from "lucide-react";
import { Input, Textarea, Select, Toggle } from "../ui/FormFields";
import { Button } from "../ui/Button";
import { useCategories, useCreateActivity, useUpdateActivity, useCalendarEvents } from "../../hooks";
import type { Activity } from "../../types";
import { todayISO, toTimeString } from "../../utils";

const schema = z
  .object({
    title: z.string().min(1, "El título es requerido").max(255),
    description: z.string().optional(),
    observations: z.string().optional(),
    category_id: z.coerce.number().min(1, "Seleccioná una categoría"),
    event_date: z.string().min(1, "La fecha es requerida"),
    start_time: z.string().optional(),
    end_time: z.string().optional(),
    priority: z.enum(["high", "medium", "low"]),
    status: z.enum(["pending", "in_progress", "completed", "cancelled"]),
    recurrence: z.enum(["none", "daily", "weekly", "monthly"]),
    recurrence_end_date: z.string().optional(),
    is_deadline: z.boolean(),
    is_all_day: z.boolean(),
  })
  .refine(
    (d) => !d.start_time || !d.end_time || d.start_time < d.end_time,
    { message: "La hora de fin debe ser posterior al inicio", path: ["end_time"] }
  );

type FormData = z.infer<typeof schema>;

// Returns activities that overlap with the given time range on the same date
const findConflicts = (
  activities: Activity[],
  date: string,
  startTime: string,
  endTime: string,
  excludeId?: number
): Activity[] => {
  if (!date || !startTime) return [];

  return activities.filter((a) => {
    if (a.event_date !== date) return false;
    if (excludeId && a.id === excludeId) return false;
    if (a.is_all_day || !a.start_time) return false;
    if (["completed", "cancelled"].includes(a.status)) return false;

    const aStart = a.start_time.slice(0, 5);
    const aEnd = a.end_time ? a.end_time.slice(0, 5) : aStart;
    const bStart = startTime;
    const bEnd = endTime || startTime;

    // Overlap: not (aEnd <= bStart or bEnd <= aStart)
    return !(aEnd <= bStart || bEnd <= aStart);
  });
};

interface ActivityFormProps {
  activity?: Activity | null;
  prefillDate?: string | null;
  onSuccess: () => void;
}

export const ActivityForm = ({ activity, prefillDate, onSuccess }: ActivityFormProps) => {
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateActivity();
  const updateMutation = useUpdateActivity();

  const isEditing = !!activity;
  const isLoading = createMutation.isPending || updateMutation.isPending;

  const [conflicts, setConflicts] = useState<Activity[]>([]);
  const [showConflictWarning, setShowConflictWarning] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      priority: "medium",
      status: "pending",
      recurrence: "none",
      is_deadline: false,
      is_all_day: false,
      event_date: prefillDate ?? todayISO(),
      category_id: 0,
    },
  });

  useEffect(() => {
    if (activity) {
      reset({
        title: activity.title,
        description: activity.description ?? "",
        observations: activity.observations ?? "",
        category_id: activity.category_id,
        event_date: activity.event_date,
        start_time: activity.start_time?.slice(0, 5) ?? "",
        end_time: activity.end_time?.slice(0, 5) ?? "",
        priority: activity.priority,
        status: activity.status,
        recurrence: activity.recurrence,
        recurrence_end_date: activity.recurrence_end_date ?? "",
        is_deadline: activity.is_deadline,
        is_all_day: activity.is_all_day,
      });
    }
  }, [activity, reset]);

  const recurrence = watch("recurrence");
  const isAllDay = watch("is_all_day");
  const watchedDate = watch("event_date");

  // Fetch events for the selected date to check conflicts
  const { data: dayEvents = [] } = useCalendarEvents(
    watchedDate || todayISO(),
    watchedDate || todayISO()
  );

  const doSave = async (payload: any) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: activity!.id, payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      onSuccess();
    } catch (err) {
      console.error(err);
    }
  };

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      start_time: data.is_all_day ? undefined : data.start_time || undefined,
      end_time: data.is_all_day ? undefined : data.end_time || undefined,
      recurrence_end_date: data.recurrence_end_date || undefined,
      description: data.description || undefined,
      observations: data.observations || undefined,
    };

    // Check for time conflicts if a start time is set
    if (!data.is_all_day && data.start_time) {
      const found = findConflicts(
        dayEvents,
        data.event_date,
        data.start_time,
        data.end_time || data.start_time,
        activity?.id
      );

      if (found.length > 0) {
        setConflicts(found);
        setPendingPayload(payload);
        setShowConflictWarning(true);
        return;
      }
    }

    await doSave(payload);
  };

  const categoryOptions = [
    { value: 0, label: "Seleccioná una categoría" },
    ...categories.map((c) => ({ value: c.id, label: `${c.icon ?? ""} ${c.name}` })),
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
      {/* Title */}
      <Input
        label="Título *"
        placeholder="Ej: Parcial 1 - Algoritmos"
        error={errors.title?.message}
        {...register("title")}
      />

      {/* Category + Date */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Categoría *"
          options={categoryOptions}
          error={errors.category_id?.message}
          {...register("category_id")}
        />
        <Input
          label="Fecha *"
          type="date"
          error={errors.event_date?.message}
          {...register("event_date")}
        />
      </div>

      {/* All day toggle */}
      <Controller
        control={control}
        name="is_all_day"
        render={({ field }) => (
          <Toggle
            label="Todo el día"
            checked={field.value}
            onChange={field.onChange}
          />
        )}
      />

      {/* Time range */}
      {!isAllDay && (
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Inicio"
            type="time"
            error={errors.start_time?.message}
            {...register("start_time")}
          />
          <Input
            label="Fin"
            type="time"
            error={errors.end_time?.message}
            {...register("end_time")}
          />
        </div>
      )}

      {/* Conflict warning */}
      {showConflictWarning && conflicts.length > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-start gap-2">
            <AlertTriangle size={16} className="text-amber-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-amber-300">Conflicto de horario</p>
              <p className="text-xs text-slate-400 mt-1">
                Ya tenés{" "}
                {conflicts.length === 1
                  ? "una actividad"
                  : `${conflicts.length} actividades`}{" "}
                en ese horario:
              </p>
              <ul className="mt-2 flex flex-col gap-1">
                {conflicts.map((c) => (
                  <li key={c.id} className="text-xs text-amber-400 flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: c.category.color }}
                    />
                    <span className="font-medium">{c.title}</span>
                    <span className="text-slate-500">
                      {toTimeString(c.start_time)}
                      {c.end_time && ` → ${toTimeString(c.end_time)}`}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="text-xs text-slate-500">¿Querés guardarla igual?</p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="flex-1"
              loading={isLoading}
              onClick={async () => {
                setShowConflictWarning(false);
                await doSave(pendingPayload);
              }}
            >
              Sí, guardar igual
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="flex-1"
              onClick={() => {
                setShowConflictWarning(false);
                setConflicts([]);
                setPendingPayload(null);
              }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* Priority + Status */}
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Prioridad"
          options={[
            { value: "high", label: "🔴 Alta" },
            { value: "medium", label: "🟡 Media" },
            { value: "low", label: "🟢 Baja" },
          ]}
          {...register("priority")}
        />
        <Select
          label="Estado"
          options={[
            { value: "pending", label: "⏳ Pendiente" },
            { value: "in_progress", label: "▶ En progreso" },
            { value: "completed", label: "✓ Completado" },
            { value: "cancelled", label: "✕ Cancelado" },
          ]}
          {...register("status")}
        />
      </div>

      {/* Recurrence */}
      <Select
        label="Recurrencia"
        options={[
          { value: "none", label: "Sin recurrencia" },
          { value: "daily", label: "Diario" },
          { value: "weekly", label: "Semanal" },
          { value: "monthly", label: "Mensual" },
        ]}
        {...register("recurrence")}
      />

      {recurrence !== "none" && (
        <Input
          label="Repetir hasta"
          type="date"
          error={errors.recurrence_end_date?.message}
          {...register("recurrence_end_date")}
        />
      )}

      {/* Deadline toggle */}
      <Controller
        control={control}
        name="is_deadline"
        render={({ field }) => (
          <Toggle
            label="Es deadline / fecha límite"
            description="Aparecerá resaltado en el dashboard como urgente"
            checked={field.value}
            onChange={field.onChange}
          />
        )}
      />

      {/* Description */}
      <Textarea
        label="Descripción"
        placeholder="Detalles opcionales..."
        {...register("description")}
      />

      {/* Observations */}
      <Textarea
        label="Observaciones"
        placeholder="Notas personales..."
        {...register("observations")}
      />

      {/* API error */}
      {(createMutation.isError || updateMutation.isError) && (
        <p className="text-sm text-rose-400 bg-rose-500/10 rounded-xl px-4 py-3 border border-rose-500/20">
          Ocurrió un error. Revisá los datos e intentá de nuevo.
        </p>
      )}

      {/* Submit */}
      {!showConflictWarning && (
        <div className="flex gap-3 pt-2 sticky bottom-0 bg-slate-900 pb-1">
          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            className="flex-1"
          >
            {isEditing ? "Guardar cambios" : "Crear actividad"}
          </Button>
        </div>
      )}
    </form>
  );
};
