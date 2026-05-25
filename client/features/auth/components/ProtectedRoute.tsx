import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("PD" | "Editor" | "Staff")[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { session, loading, role } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background">
        <div className="relative flex items-center justify-center">
          {/* Inner brand glow */}
          <div className="absolute w-12 h-12 bg-primary/10 rounded-full blur-xl animate-pulse" />
          {/* Custom premium loader spinner */}
          <Loader2 className="h-8 w-8 animate-spin text-primary relative z-10" />
        </div>
        <p className="mt-4 text-sm font-medium text-muted-foreground animate-pulse">
          Resolving secure session…
        </p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
