import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { validateEmail } from "@/lib/auth-config";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: "PD" | "Editor" | "Staff" | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<"PD" | "Editor" | "Staff" | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserRole = async (email: string): Promise<"PD" | "Editor" | "Staff"> => {
    console.log("[AuthContext] fetchUserRole started for:", email);
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const { data, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("email", normalizedEmail)
        .single();
      
      console.log("[AuthContext] fetchUserRole query result for", normalizedEmail, ":", data, "error:", roleError);
      if (data) {
        return data.role as "PD" | "Editor" | "Staff";
      }
    } catch (err) {
      console.error("[AuthContext] Error fetching user role:", err);
    }
    return "Staff"; // fallback default
  };

  // 1. Listen for auth state changes. This callback is completely synchronous
  // and does not make any Supabase API calls. This prevents GoTrueClient deadlocks.
  useEffect(() => {
    console.log("[AuthContext] Registering onAuthStateChange listener");
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log("[AuthContext] onAuthStateChange event:", event, "email:", currentSession?.user?.email);
        
        // Sync states synchronously
        setSession(currentSession);
        setUser(currentSession ? currentSession.user : null);

        // If there's no session, we are logged out
        if (!currentSession) {
          setRole(null);
          setLoading(false);
        }
      }
    );

    return () => {
      console.log("[AuthContext] Unsubscribing onAuthStateChange");
      subscription.unsubscribe();
    };
  }, []);

  // 2. React to session changes outside of the auth state listener callback.
  // This allows database queries and signOut calls to proceed without deadlock.
  useEffect(() => {
    const handleSession = async () => {
      if (!session) return;
      
      const email = session.user?.email;
      console.log("[AuthContext] Handling session for email:", email);

      if (validateEmail(email)) {
        const shouldShowLoading = !role;
        if (shouldShowLoading) {
          setLoading(true);
        }
        const userRole = await fetchUserRole(email!);
        console.log("[AuthContext] Role resolved:", userRole);
        setRole(userRole);
        setError(null);
        if (shouldShowLoading) {
          setLoading(false);
        }
      } else {
        setLoading(true);
        console.warn("[AuthContext] Invalid email, signing out:", email);
        try {
          await supabase.auth.signOut();
        } catch (err) {
          console.error("[AuthContext] Error signing out unauthorized email:", err);
        }
        setSession(null);
        setUser(null);
        setRole(null);
        setError("Access denied. Your account is not authorized to access this system. Please contact the administrator.");
        setLoading(false);
      }
    };

    handleSession();
  }, [session]);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { error: authError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            prompt: "select_account",
          },
        },
      });

      if (authError) {
        throw authError;
      }
    } catch (err: any) {
      console.error("[AuthContext] Google login failed:", err);
      setError(err.message || "Failed to initialize Google login.");
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await supabase.auth.signOut();
    } catch (err: any) {
      console.error("[AuthContext] Log out failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        role,
        loading,
        error,
        signInWithGoogle,
        signOut,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
