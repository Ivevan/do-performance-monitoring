import { Request, Response, NextFunction } from "express";
import { supabase } from "../config/supabase";

export interface AuthenticatedRequest extends Request {
  user?: any;
}

const ALLOWED_EMAIL_SUFFIXES = [".dostxi@gmail.com", "@region11.dost.gov.ph"];

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

    // Attach authenticated user information to the request
    req.user = user;
    next();
  } catch (err) {
    console.error("Authentication middleware error:", err);
    return res.status(500).json({ error: "Internal authentication error." });
  }
}
