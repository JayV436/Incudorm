import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY)?.trim();

/** False until both values are in your .env. App.tsx shows setup instructions instead of crashing. */
export const supabaseConfigured = Boolean(url && key);

// createClient throws on empty values, so use harmless placeholders when .env is missing.
export const supabase = createClient(url || "http://localhost:54321", key || "missing-key", {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});
