import { supabase } from "./supabase";

/**
 * Custom fetch wrapper that automatically retrieves the active Supabase user session token
 * and appends it to the Request Headers in the 'Authorization: Bearer <token>' format.
 */
export async function apiFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const sessionRes = await supabase.auth.getSession();
  const token = sessionRes.data.session?.access_token;
  
  const headers = new Headers(options.headers || {});
  
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  
  return fetch(url, {
    ...options,
    headers,
  });
}
