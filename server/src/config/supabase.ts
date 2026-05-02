import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || "";

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn("Missing SUPABASE_URL or SUPABASE_SERVICE_KEY environment variables.");
}

// Use the service key for backend operations to bypass RLS if needed, 
// or use the anon key if enforcing RLS is desired.
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
