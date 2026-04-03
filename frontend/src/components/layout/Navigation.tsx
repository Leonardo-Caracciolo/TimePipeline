import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard, Calendar, ListTodo,
  Settings, X, Zap, LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useUIStore } from "../../store/uiStore";
import { useAuthStore } from "../../store/authStore";
import { useLogout } from "../../hooks/auth";
import { cn } from "../../utils";

const NAV_ITEMS = [
  { to: "/",           label: "Dashboard",     icon: LayoutDashboard },
  { to: "/calendar",   label: "Calendario",    icon: Calendar },
  { to: "/activities", label: "Actividades",   icon: ListTodo },
  { to: "/settings",   label: "Configuración", icon: Settings },
];

const NavItem = ({
  to, label, icon: Icon, onClick,
}: (typeof NAV_ITEMS)[0] & { onClick?: () => void }) => (
  <NavLink
    to={to}
    onClick={onClick}
    end={to === "/"}
    className={({ isActive }) =>
      cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 min-h-[44px]",
        isActive
          ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/20"
          : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
      )
    }
  >
    <Icon size={18} />
    {label}
  </NavLink>
);

// ── Desktop sidebar ───────────────────────────────────────────────────────────
export const Sidebar = () => {
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 bg-slate-950 border-r border-white/8 h-screen sticky top-0 p-4 gap-6">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-1 pt-2">
        <div className="p-2 bg-indigo-600/20 rounded-xl border border-indigo-500/20">
          <Zap size={18} className="text-indigo-400" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-100 tracking-tight">TimePipeline</p>
          <p className="text-[10px] text-slate-500">Personal OS</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </nav>

      {/* User info + logout */}
      <div className="border-t border-white/8 pt-4 flex flex-col gap-2">
        {user && (
          <div className="px-3 py-2">
            <p className="text-xs font-medium text-slate-300 truncate">{user.name}</p>
            <p className="text-[10px] text-slate-600 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-rose-400 hover:bg-rose-500/8 transition-all duration-150 min-h-[44px]"
        >
          <LogOut size={18} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
};

// ── Mobile drawer ─────────────────────────────────────────────────────────────
export const MobileDrawer = () => {
  const { isSidebarOpen, closeSidebar } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const logout = useLogout();

  return (
    <AnimatePresence>
      {isSidebarOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            onClick={closeSidebar}
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 400 }}
            className="fixed left-0 top-0 bottom-0 w-72 bg-slate-950 border-r border-white/10 z-50 p-4 flex flex-col gap-6 md:hidden"
          >
            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2.5 px-1">
                <div className="p-2 bg-indigo-600/20 rounded-xl border border-indigo-500/20">
                  <Zap size={18} className="text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-100">TimePipeline</p>
                  <p className="text-[10px] text-slate-500">Personal OS</p>
                </div>
              </div>
              <button
                onClick={closeSidebar}
                className="p-2 rounded-xl hover:bg-white/8 text-slate-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex flex-col gap-1 flex-1">
              {NAV_ITEMS.map((item) => (
                <NavItem key={item.to} {...item} onClick={closeSidebar} />
              ))}
            </nav>

            <div className="border-t border-white/8 pt-4 flex flex-col gap-2">
              {user && (
                <div className="px-3 py-2">
                  <p className="text-xs font-medium text-slate-300 truncate">{user.name}</p>
                  <p className="text-[10px] text-slate-600 truncate">{user.email}</p>
                </div>
              )}
              <button
                onClick={() => { logout(); closeSidebar(); }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:text-rose-400 hover:bg-rose-500/8 transition-all min-h-[44px]"
              >
                <LogOut size={18} />
                Cerrar sesión
              </button>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

// ── Mobile bottom nav ─────────────────────────────────────────────────────────
export const MobileBottomNav = () => {
  const location = useLocation();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-t border-white/8 z-30 safe-area-bottom">
      <div className="flex items-center justify-around px-2 pt-2 pb-safe">
        {NAV_ITEMS.map(({ to, label, icon: Icon }) => {
          const isActive =
            to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className="flex flex-col items-center gap-0.5 px-4 py-2 min-h-[56px] justify-center"
            >
              <Icon size={22} className={cn("transition-colors", isActive ? "text-indigo-400" : "text-slate-500")} />
              <span className={cn("text-[10px] font-medium transition-colors", isActive ? "text-indigo-400" : "text-slate-600")}>
                {label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

// ── Mobile top header ─────────────────────────────────────────────────────────
export const MobileHeader = () => {
  const { toggleSidebar, openCreateModal } = useUIStore();
  const location = useLocation();

  const title =
    NAV_ITEMS.find((n) =>
      n.to === "/" ? location.pathname === "/" : location.pathname.startsWith(n.to)
    )?.label ?? "TimePipeline";

  return (
    <header className="md:hidden sticky top-0 z-20 flex items-center justify-between px-4 py-3 bg-slate-950/90 backdrop-blur-xl border-b border-white/8">
      <button
        onClick={toggleSidebar}
        className="p-2 rounded-xl hover:bg-white/8 text-slate-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
      >
        <Zap size={20} className="text-indigo-400" />
      </button>
      <h1 className="text-sm font-semibold text-slate-200">{title}</h1>
      <button
        onClick={() => openCreateModal()}
        className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/20 text-indigo-400 min-h-[44px] min-w-[44px] flex items-center justify-center"
      >
        <span className="text-lg font-light leading-none">+</span>
      </button>
    </header>
  );
};
