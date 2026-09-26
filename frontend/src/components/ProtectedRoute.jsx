import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children, role }) {
  const { user, loading, isClient, isTechnician, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  }

  if (role && !user.roles?.includes(role)) {
    // If user doesn't have the required role, redirect to a dashboard they do have access to
    const redirect = isAdmin
      ? "/dashboard/admin"
      : isTechnician
        ? "/dashboard/technician"
        : "/dashboard/client";
    return <Navigate to={redirect} replace />;
  }

  return children;
}
