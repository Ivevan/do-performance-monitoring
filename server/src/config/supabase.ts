import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

// Load .env.local in development if it exists, otherwise fall back to .env
const envPath = fs.existsSync(path.resolve(process.cwd(), ".env.local"))
  ? path.resolve(process.cwd(), ".env.local")
  : path.resolve(process.cwd(), ".env");
dotenv.config({ path: envPath });

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("Missing SUPABASE_URL, VITE_SUPABASE_URL, SUPABASE_SERVICE_KEY, or VITE_SUPABASE_ANON_KEY environment variables.");
}

// Use the service key for backend operations to bypass RLS if needed, 
// or use the anon key if enforcing RLS is desired.
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
