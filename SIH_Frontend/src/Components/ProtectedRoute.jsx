import { Navigate } from "react-router-dom";
import { useUser } from "../Context/UserContext";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children, requireAdmin = false, requireBank = false }) {
  const { isAuthenticated, loading, user } = useUser();
  const [ready, setReady] = useState(false);

  // Wait until initial loading finishes before deciding redirect
  useEffect(() => {
    if (!loading) {
      // Add a small delay to allow context updates to settle
      const timer = setTimeout(() => setReady(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  // Still checking authentication → show loader
  if (loading || !ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-gray-500 text-lg">Checking authentication...</span>
      </div>
    );
  }

  // Not authenticated → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role-based restrictions
  if (requireAdmin && user?.role !== 1) {
    return <Navigate to="/dashboard" replace />;
  }

  if (requireBank && user?.role !== 2) {
    return <Navigate to="/dashboard" replace />;
  }

  // Authorized → render protected content
  return children;
}