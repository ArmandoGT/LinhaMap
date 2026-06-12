/**
 * Cliente Supabase server-side (service role).
 * Usado apenas quando ENABLE_MOCK_DATA=false e há credenciais.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { config } from "@/lib/config";

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (!config.supabaseUrl || !config.supabaseServiceKey) {
    throw new Error(
      "Supabase não configurado. Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  if (!cached) {
    cached = createClient(config.supabaseUrl, config.supabaseServiceKey, {
      auth: { persistSession: false },
    });
  }
  return cached;
}
