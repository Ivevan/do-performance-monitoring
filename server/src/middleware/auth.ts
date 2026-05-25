import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";
import { supabase } from "../config/supabase";

export interface AuthenticatedRequest extends Request {
  user?: any;
}

const ALLOWED_EMAIL_SUFFIXES = [".dostxi@gmail.com", "@region11.dost.gov.ph", "@gmail.com"];

/**
 * Creates a request-scoped Supabase client using the authenticated user's JWT.
 */
export function getRequestScopedSupabase(req: Request) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  return createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_KEY || "",
    {
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
      auth: {
        persistSession: false,
      },
    }
  );
}

/**
 * Express middleware to authenticate requests.
 * Extracts the Supabase JWT token from the Authorization header,
 * verifies it with Supabase Auth, and validates the email pattern.
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. No token provided." });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify the client token using the Supabase client
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: "Access denied. Invalid or expired token." });
    }

    // Enforce email format verification
    const email = user.email || "";
    const isValidEmail = ALLOWED_EMAIL_SUFFIXES.some(suffix =>
      email.toLowerCase().includes(suffix.toLowerCase())
    );

    if (!isValidEmail) {
      return res.status(403).json({
        error: "Access denied. Your account is not authorized to access this system."
      });
    }

    // Use request-scoped client to query user_roles table
    const userClient = getRequestScopedSupabase(req);
    const normalizedEmail = email.trim().toLowerCase();
    const { data: roleData, error: roleError } = await userClient
      .from("user_roles")
      .select("role")
      .eq("email", normalizedEmail)
      .single();

    let role = "Staff"; // Default fallback role
    if (roleError && roleError.code !== "PGRST116") {
      console.error("Error querying user roles table:", roleError);
    } else if (roleData) {
      role = roleData.role;
    } else {
      console.log(`[Auth Middleware] User ${normalizedEmail} not found in user_roles. Defaulting to Staff. Auto-registration handled by DB trigger.`);
    }

    // Attach authenticated user information and their role to the request
    req.user = {
      ...user,
      role
    };
    next();
  } catch (err) {
    console.error("Authentication middleware error:", err);
    return res.status(500).json({ error: "Internal authentication error." });
  }
}

/**
 * Middleware to restrict endpoints based on user roles.
 */
export function requireRole(allowedRoles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: "Access denied. User not authenticated or role missing." });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: "Access denied. Your account does not have permission to perform this action."
      });
    }

    next();
  };
}
