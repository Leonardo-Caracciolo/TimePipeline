import { motion } from "framer-motion";
import { cn } from "../../utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  color: "indigo" | "amber" | "rose" | "emerald" | "sky";
  delay?: number;
}

const colorMap = {
  indigo: {
    bg: "bg-indigo-500/10",
    icon: "text-indigo-400",
    value: "text-indigo-300",
    border: "border-indigo-500/20",
  },
  amber: {
    bg: "bg-amber-500/10",
    icon: "text-amber-400",
    value: "text-amber-300",
    border: "border-amber-500/20",
  },
  rose: {
    bg: "bg-rose-500/10",
    icon: "text-rose-400",
    value: "text-rose-300",
    border: "border-rose-500/20",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    icon: "text-emerald-400",
    value: "text-emerald-300",
    border: "border-emerald-500/20",
  },
  sky: {
    bg: "bg-sky-500/10",
    icon: "text-sky-400",
    value: "text-sky-300",
    border: "border-sky-500/20",
  },
};

export const StatCard = ({
  label,
  value,
  icon: Icon,
  color,
  delay = 0,
}: StatCardProps) => {
  const c = colorMap[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={cn(
        "bg-white/3 border rounded-2xl p-4 flex items-center gap-4",
        c.border
      )}
    >
      <div className={cn("p-3 rounded-xl", c.bg)}>
        <Icon size={20} className={c.icon} />
      </div>
      <div>
        <p className={cn("text-2xl font-bold tabular-nums", c.value)}>{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      </div>
    </motion.div>
  );
};
