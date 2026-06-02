import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { validateEmail } from "@/lib/auth-config";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { API_URL } from "@/lib/config";

export interface UserProfile {
  name: string;
  email: string;
  avatarUrl: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  role: "PD" | "Editor" | "Staff" | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<"PD" | "Editor" | "Staff" | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserRole = async (email: string): Promise<"PD" | "Editor" | "Staff"> => {
    console.log("[AuthContext] fetchUserRole started for:", email);
    const normalizedEmail = email.trim().toLowerCase();
    
    // Automatic Role Assignment Rules:
    // - Government emails (ending with @region11.dost.gov.ph or containing dost.gov.ph / .gov.ph) are automatically Editors
    // - Specific whitelisted tester accounts (e.g. ivasay997.dostxi@gmail.com) are automatically Editors
    // - Other authorized emails (like other .dostxi@gmail.com emails) are automatically Staff (Viewers)
    if (
      normalizedEmail.endsWith("@region11.dost.gov.ph") || 
      normalizedEmail.endsWith(".gov.ph") || 
      normalizedEmail.includes("dost.gov.ph") ||
      normalizedEmail === "ivasay997.dostxi@gmail.com"
    ) {
      return "Editor";
    }
    return "Staff"; // Default fallback (Viewer)
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
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      console.log("[AuthContext] Unsubscribing onAuthStateChange");
      subscription.unsubscribe();
    };
  }, []);

  const refreshProfile = async () => {
    if (!session || !session.user) {
      setProfile(null);
      return;
    }
    try {
      const res = await apiFetch(`${API_URL}/api/users/profile`);
      if (res.ok) {
        const data = await res.json();
        setProfile({
          name: data.name || "",
          email: data.email || "",
          avatarUrl: data.avatar_url || null,
        });
      } else {
        throw new Error("Failed to fetch profile");
      }
    } catch (err) {
      console.error("[AuthContext] Error fetching profile, using metadata fallback:", err);
      const meta = session.user.user_metadata || {};
      setProfile({
        name: meta.full_name || meta.name || "DOST User",
        email: session.user.email || "",
        avatarUrl: meta.avatar_url || meta.picture || null,
      });
    }
  };

  // 2. React to session changes outside of the auth state listener callback.
  // This allows database queries and signOut calls to proceed without deadlock.
  useEffect(() => {
    const handleSession = async () => {
      if (!session) {
        setProfile(null);
        return;
      }
      
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

        // Fetch profile details
        try {
          const res = await apiFetch(`${API_URL}/api/users/profile`);
          if (res.ok) {
            const data = await res.json();
            setProfile({
              name: data.name || "",
              email: data.email || "",
              avatarUrl: data.avatar_url || null,
            });
          } else {
            throw new Error("Profile API returned error status");
          }
        } catch (err) {
          console.error("[AuthContext] Error fetching profile during initialization, using metadata fallback:", err);
          const meta = session.user?.user_metadata || {};
          setProfile({
            name: meta.full_name || meta.name || "DOST User",
            email: session.user?.email || "",
            avatarUrl: meta.avatar_url || meta.picture || null,
          });
        }

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
        setProfile(null);
        setError("Access denied. Your account is not authorized to access this system. Please contact the administrator.");
        setLoading(false);
      }
    };

    handleSession();
  }, [session]);

  // 3. Idle Timeout / Auto-Logout for Inactivity (Persists across page loads/closes via localStorage)
  useEffect(() => {
    if (!session) return;

    // Timeout duration: 15 minutes (15 * 60 * 1000 ms)
    const TIMEOUT_MS = 15 * 60 * 1000;
    let timeoutId: any;

    const handleLogout = async () => {
      console.log("[AuthContext] User inactive. Logging out automatically...");
      localStorage.removeItem("lastActiveTime");
      toast.info("You have been logged out due to inactivity.", {
        duration: 10000,
        id: "inactivity-logout-toast"
      });
      await signOut();
    };

    // Check if the user was already inactive before this session initialized (e.g. on page reload or reopening tab)
    const storedLastActive = localStorage.getItem("lastActiveTime");
    const currentTime = Date.now();
    
    if (storedLastActive) {
      const parsedTime = Number(storedLastActive);
      if (!isNaN(parsedTime)) {
        const elapsed = currentTime - parsedTime;
        if (elapsed >= TIMEOUT_MS) {
          // User was inactive for too long, log out immediately
          handleLogout();
          return;
        }
      }
    }

    // Set or refresh initial active timestamp
    localStorage.setItem("lastActiveTime", currentTime.toString());

    const resetTimer = () => {
      const now = Date.now();
      const lastActive = Number(localStorage.getItem("lastActiveTime") || "0");
      
      // Throttle event checks to every 2 seconds to optimize browser thread CPU usage and localStorage writes
      if (now - lastActive < 2000) {
        return;
      }
      
      localStorage.setItem("lastActiveTime", now.toString());
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(handleLogout, TIMEOUT_MS);
    };

    // Set initial timeout based on remaining time if any, or full TIMEOUT_MS
    const initialElapsed = storedLastActive ? (currentTime - Number(storedLastActive)) : 0;
    const remainingTime = Math.max(0, TIMEOUT_MS - (isNaN(initialElapsed) ? 0 : initialElapsed));
    timeoutId = setTimeout(handleLogout, remainingTime);

    const activityEvents = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click"
    ];

    activityEvents.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      activityEvents.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };
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
      localStorage.removeItem("lastActiveTime");
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
        profile,
        loading,
        error,
        signInWithGoogle,
        signOut,
        clearError,
        refreshProfile,
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
