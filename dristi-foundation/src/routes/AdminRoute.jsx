import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loader from "../components/Loader";

export default function AdminRoute({ children }) {
  const { user, isAdmin, adminMfaEnabled, assuranceLevel, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader />;
  if (!user) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  if (!adminMfaEnabled) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  if (assuranceLevel !== "aal2") {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }
  return children;
}
