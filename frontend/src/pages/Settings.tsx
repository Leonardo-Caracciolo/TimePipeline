import { useState } from "react";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { useCategories, useCreateCategory, useDeleteCategory } from "../hooks";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/FormFields";

const PRESET_COLORS = [
  "#6366F1", "#0EA5E9", "#10B981", "#F59E0B",
  "#EC4899", "#8B5CF6", "#F97316", "#14B8A6",
];

const EMOJI_OPTIONS = [
  "🎓", "📚", "💼", "🏢", "🌟", "📅", "⚡", "🎯",
  "💡", "🏋️", "🩺", "✈️", "🎮", "📝", "🔧", "🎨",
  "🏆", "💰", "📊", "🔬", "🎵", "🍎", "🏠", "🚀",
];

export const SettingsPage = () => {
  const { data: categories = [] } = useCategories();
  const createMutation = useCreateCategory();
  const deleteMutation = useDeleteCategory();

  const [newName, setNewName] = useState("");
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const [newIcon, setNewIcon] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    setCreateError(null);
    try {
      await createMutation.mutateAsync({
        name: newName.trim(),
        color: newColor,
        icon: newIcon || undefined,
      });
      setNewName("");
      setNewIcon("");
      setShowEmojiPicker(false);
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? "No se pudo crear la categoría.";
      setCreateError(detail);
    }
  };

  const handleDeleteClick = (id: number) => {
    setDeleteError(null);
    setConfirmDeleteId(id);
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDeleteId) return;
    try {
      await deleteMutation.mutateAsync(confirmDeleteId);
      setConfirmDeleteId(null);
      setDeleteError(null);
    } catch (err: any) {
      const detail = err?.response?.data?.detail ?? "No se pudo eliminar la categoría.";
      setDeleteError(detail);
    }
  };

  const confirmingCategory = categories.find((c) => c.id === confirmDeleteId);

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto pb-24 md:pb-8">
      <h1 className="text-2xl font-bold text-slate-100 tracking-tight hidden md:block">
        Configuración
      </h1>

      {/* Categories */}
      <section className="bg-white/3 border border-white/8 rounded-2xl p-5 flex flex-col gap-5">
        <div>
          <h2 className="text-sm font-semibold text-slate-200">Categorías</h2>
          <p className="text-xs text-slate-500 mt-1">
            Podés eliminar cualquier categoría que no tenga actividades asignadas
          </p>
        </div>

        {/* Confirm delete panel */}
        {confirmDeleteId && confirmingCategory && (
          <div className="bg-rose-500/8 border border-rose-500/20 rounded-xl p-4 flex flex-col gap-3">
            <p className="text-sm text-rose-300 font-medium">
              ¿Eliminar "{confirmingCategory.name}"?
            </p>
            <p className="text-xs text-slate-500">Esta acción no se puede deshacer.</p>
            {deleteError && (
              <div className="flex items-start gap-2 bg-rose-500/10 rounded-lg px-3 py-2">
                <AlertCircle size={14} className="text-rose-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-rose-400">{deleteError}</p>
              </div>
            )}
            <div className="flex gap-2">
              <Button
                variant="danger"
                size="sm"
                loading={deleteMutation.isPending}
                onClick={handleDeleteConfirm}
                className="flex-1"
              >
                Sí, eliminar
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => { setConfirmDeleteId(null); setDeleteError(null); }}
                className="flex-1"
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}

        {/* Category list */}
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
                {cat.activity_count}{" "}
                {cat.activity_count === 1 ? "actividad" : "actividades"}
              </span>
              <button
                onClick={() => handleDeleteClick(cat.id)}
                disabled={cat.activity_count > 0 || confirmDeleteId === cat.id}
                className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-500 hover:text-rose-400 transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
                title={
                  cat.activity_count > 0
                    ? `No se puede eliminar: tiene ${cat.activity_count} ${cat.activity_count === 1 ? "actividad" : "actividades"}`
                    : "Eliminar categoría"
                }
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        {/* Add new */}
        <div className="border-t border-white/8 pt-4 flex flex-col gap-3">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Nueva categoría
          </p>

          {/* Emoji selector */}
          <div className="flex flex-col gap-2">
            <p className="text-xs text-slate-500">Ícono</p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowEmojiPicker((v) => !v)}
                className="w-11 h-11 flex items-center justify-center bg-white/5 border border-white/10 rounded-xl text-xl hover:bg-white/10 transition-colors"
                title="Elegir emoji"
              >
                {newIcon || "＋"}
              </button>
              {newIcon && (
                <button
                  type="button"
                  onClick={() => setNewIcon("")}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Quitar
                </button>
              )}
            </div>

            {showEmojiPicker && (
              <div className="grid grid-cols-8 gap-1 p-3 bg-white/3 border border-white/10 rounded-xl">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => {
                      setNewIcon(emoji);
                      setShowEmojiPicker(false);
                    }}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-lg hover:bg-white/10 transition-colors ${
                      newIcon === emoji ? "bg-indigo-500/20 border border-indigo-500/30" : ""
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Name */}
          <Input
            placeholder="Nombre de la categoría"
            value={newName}
            onChange={(e) => { setNewName(e.target.value); setCreateError(null); }}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />

          {/* Error message for duplicate */}
          {createError && (
            <div className="flex items-start gap-2 bg-rose-500/10 rounded-lg px-3 py-2 border border-rose-500/20">
              <AlertCircle size={14} className="text-rose-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-rose-400">{createError}</p>
            </div>
          )}

          {/* Color picker */}
          <div className="flex flex-col gap-2">
            <p className="text-xs text-slate-500">Color</p>
            <div className="flex gap-2 flex-wrap">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setNewColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    newColor === c
                      ? "scale-125 ring-2 ring-white/40 ring-offset-1 ring-offset-slate-900"
                      : "hover:scale-110"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
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
