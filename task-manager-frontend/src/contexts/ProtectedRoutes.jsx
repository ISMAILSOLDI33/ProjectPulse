import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContexts";

export default function ProtectedRoute({ children, adminOnly }) {
  const { isAuthenticated, isAdmin } = useAuth();

  if (!isAuthenticated) return <Navigate to="/home" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/home" replace />;
  return children;
}
