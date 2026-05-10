import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

export function ProtectedRoute({ adminOnly = false }: { adminOnly?: boolean }) {
  const user = useAuthStore((state) => state.user);
  if (!user) return <Navigate to="/auth" replace />;
  if (adminOnly && user.role !== "ADMIN") return <Navigate to="/" replace />;
  return <Outlet />;
}
