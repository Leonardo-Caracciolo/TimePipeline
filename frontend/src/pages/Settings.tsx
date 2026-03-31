import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useCategories, useCreateCategory, useDeleteCategory } from "../hooks";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/FormFields";

const PRESET_COLORS = [
  "#6366F1", "#0EA5E9", "#10B981", "#F59E0B",
  "#EC4899", "#8B5CF6", "#F97316", "#14B8A6",
];

export const SettingsPage = () => {
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateCategory();
  const deleteMutation = useDeleteCategory();

  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [newIcon, setNewIcon] = useState("");

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createMutation.mutateAsync({ name: newName.trim(), color: newColor, icon: newIcon || undefined });
    setNewName("");
    setNewIcon("");
  };

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto pb-24 md:pb-8">
      <h1 className="text-2xl font-bold text-slate-100 tracking-tight hidden md:block">
        Configuración
      </h1>

      {/* Categories */}
      <section className="bg-white/3 border border-white/8 rounded-2xl p-5 flex flex-col gap-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">Categorías</h2>
          <p className="text-xs text-slate-500 mt-1">Gestioná tus categorías personales</p>
        </div>

        {/* Existing */}
        <div className="flex flex-col gap-2">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-3 p-3 bg-white/3 rounded-xl border border-white/8"
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-sm text-slate-200 flex-1">
                {cat.icon} {cat.name}
              </span>
              <span className="text-xs text-slate-600">
                {cat.activity_count} actividades
              </span>
              {!cat.is_system && (
                <button
                  onClick={() => deleteMutation.mutate(cat.id)}
                  disabled={cat.activity_count > 0}
                  className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title={
                    cat.activity_count > 0
                      ? "No se puede eliminar: tiene actividades asociadas"
                      : "Eliminar"
                  }
                >
                  <Trash2 size={14} />
                </button>
              )}
              {cat.is_system && (
                <span className="text-[10px] text-slate-600 px-2 py-0.5 rounded-full bg-white/5">
                  Sistema
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Add new */}
        <div className="border-t border-white/8 pt-4 flex flex-col gap-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Nueva categoría
          </p>
          <div className="flex gap-2">
            <Input
              placeholder="Emoji (opcional)"
              value={newIcon}
              onChange={(e) => setNewIcon(e.target.value)}
              className="w-20 text-center"
              maxLength={4}
            />
            <Input
              placeholder="Nombre"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="flex-1"
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
            />
          </div>

          {/* Color picker */}
          <div className="flex gap-2 flex-wrap">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setNewColor(c)}
                className={`w-7 h-7 rounded-full transition-transform ${
                  newColor === c ? "scale-125 ring-2 ring-white/40 ring-offset-1 ring-offset-slate-900" : "hover:scale-110"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            icon={<Plus size={14} />}
            onClick={handleCreate}
            loading={createMutation.isPending}
            disabled={!newName.trim()}
          >
            Agregar categoría
          </Button>
        </div>
      </section>

      {/* About */}
      <section className="bg-white/3 border border-white/8 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-slate-200 mb-1">Acerca de</h2>
        <p className="text-xs text-slate-500">TimePipeline v1.0.0</p>
        <p className="text-xs text-slate-600 mt-1">
          Sistema personal de organización de actividades y calendario inteligente.
        </p>
      </section>
    </div>
  );
};
