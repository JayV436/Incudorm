import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  (import.meta.env.VITE_SUPABASE_URL as string | undefined) ||
  "https://placeholder.supabase.co";

const supabaseAnonKey =
  (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined) ||
  "placeholder-anon-key";

if (
  !import.meta.env.VITE_SUPABASE_URL ||
  !import.meta.env.VITE_SUPABASE_ANON_KEY
) {
  console.warn(
    "[Incudorm] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is not set. " +
      "Add these to your Vercel project environment variables (or .env.local for local dev). " +
      "The app will not function correctly until they are configured.",
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
