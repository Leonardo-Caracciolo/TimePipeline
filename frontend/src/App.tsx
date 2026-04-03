import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Sidebar, MobileDrawer, MobileBottomNav, MobileHeader } from "./components/layout/Navigation";
import { ActivityModal } from "./components/activities/ActivityModal";
import { ProtectedRoute } from "./components/layout/ProtectedRoute";
import { Dashboard } from "./pages/Dashboard";
import { CalendarPage } from "./pages/Calendar";
import { ActivitiesPage } from "./pages/Activities";
import { SettingsPage } from "./pages/Settings";
import { LoginPage } from "./pages/Login";
import { RegisterPage } from "./pages/Register";
import { useAuthStore } from "./store/authStore";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppLayout() {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <MobileDrawer />

      <main className="flex-1 flex flex-col min-w-0">
        <MobileHeader />
        <div className="flex-1 px-4 py-6 md:px-8 md:py-8 overflow-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/activities" element={<ActivitiesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </main>

      <MobileBottomNav />
      <ActivityModal />
    </div>
  );
}

function AuthGuard() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/register"
        element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
      />

      {/* Protected routes */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthGuard />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
