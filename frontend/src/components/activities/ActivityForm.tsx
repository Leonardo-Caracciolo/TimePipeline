import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input, Textarea, Select, Toggle } from "../ui/FormFields";
import { Button } from "../ui/Button";
import { useCategories, useCreateActivity, useUpdateActivity } from "../../hooks";
import type { Activity } from "../../types";
import { todayISO } from "../../utils";

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

  const onSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      start_time: data.is_all_day ? undefined : data.start_time || undefined,
      end_time: data.is_all_day ? undefined : data.end_time || undefined,
      recurrence_end_date: data.recurrence_end_date || undefined,
      description: data.description || undefined,
      observations: data.observations || undefined,
    };

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: activity!.id, payload });
      } else {
        await createMutation.mutateAsync(payload as any);
      }
      onSuccess();
    } catch (err) {
      console.error(err);
    }
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

      {/* Error message */}
      {(createMutation.isError || updateMutation.isError) && (
        <p className="text-sm text-rose-400 bg-rose-500/10 rounded-xl px-4 py-3 border border-rose-500/20">
          Ocurrió un error. Revisá los datos e intentá de nuevo.
        </p>
      )}

      {/* Actions */}
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
    </form>
  );
};
