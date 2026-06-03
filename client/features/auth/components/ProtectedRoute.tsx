import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";
import { DataPrivacyConsent } from "./DataPrivacyConsent";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ("Editor" | "Staff")[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { session, loading, role, signOut } = useAuth();
  
  const email = session?.user?.email;
  const consentKey = email ? `data-privacy-consent:${email.trim().toLowerCase()}` : null;

  const [consentAccepted, setConsentAccepted] = useState(() => {
    if (!consentKey) return false;
    return sessionStorage.getItem(consentKey) === "true";
  });

  useEffect(() => {
    if (session && !consentAccepted) {
      // Check if page was refreshed/reloaded while on consent screen
      const navTiming = window.performance?.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      if (navTiming?.type === "reload") {
        console.log("[ProtectedRoute] Page reload detected while consent is pending. Signing out.");
        signOut();
      }
    }
  }, [session, consentAccepted, signOut]);

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

  // Intercept access with Data Privacy Consent if not agreed yet
  if (!consentAccepted) {
    const handleAccept = () => {
      if (consentKey) {
        sessionStorage.setItem(consentKey, "true");
      }
      setConsentAccepted(true);
    };

    const handleDecline = async () => {
      try {
        await signOut();
      } catch (err) {
        console.error("[ProtectedRoute] Error signing out on decline:", err);
      }
    };

    return <DataPrivacyConsent onAccept={handleAccept} onDecline={handleDecline} />;
  }

  if (allowedRoles && role && !allowedRoles.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
