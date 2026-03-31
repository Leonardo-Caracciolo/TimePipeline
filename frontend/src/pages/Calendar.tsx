import { CalendarGrid } from "../components/calendar/CalendarGrid";
import { ActivityModal } from "../components/activities/ActivityModal";

export const CalendarPage = () => (
  <div className="flex flex-col h-full pb-20 md:pb-0">
    <div className="flex items-center justify-between mb-2">
      <h1 className="text-2xl font-bold text-slate-100 tracking-tight hidden md:block">
        Calendario
      </h1>
    </div>
    <div className="flex-1 bg-white/2 border border-white/8 rounded-2xl overflow-hidden">
      <CalendarGrid />
    </div>
    <ActivityModal />
  </div>
);
