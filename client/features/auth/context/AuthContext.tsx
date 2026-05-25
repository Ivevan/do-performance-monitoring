import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { validateEmail, ALLOWED_EMAIL_SUFFIXES } from "@/lib/auth-config";

interface AuthContextType {
  user: User | null;
  session: Session | null;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. Check active session on mount
    const initSession = async () => {
      try {
        const { data: { session: activeSession } } = await supabase.auth.getSession();
        
        if (activeSession) {
          const email = activeSession.user?.email;
          if (validateEmail(email)) {
            setSession(activeSession);
            setUser(activeSession.user);
          } else {
            // Immediately sign out unauthorized email format on initial load
            await supabase.auth.signOut();
            setError("Access denied. Your account is not authorized to access this system. Please contact the administrator.");
          }
        }
      } catch (err) {
        console.error("Error checking active session:", err);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setLoading(true);
        if (currentSession) {
          const email = currentSession.user?.email;
          if (validateEmail(email)) {
            setSession(currentSession);
            setUser(currentSession.user);
            setError(null);
          } else {
            // Sign out unauthorized email format
            await supabase.auth.signOut();
            setSession(null);
            setUser(null);
            setError("Access denied. Your account is not authorized to access this system. Please contact the administrator.");
          }
        } else {
          // Triggered on logout
          setSession(null);
          setUser(null);
          if (event === "SIGNED_OUT") {
            // Keep existing domain error if we forced sign out, otherwise clear
            setError((prev) => (prev?.startsWith("Access denied") ? prev : null));
          }
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
      console.error("Google login failed:", err);
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
      console.error("Log out failed:", err);
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
